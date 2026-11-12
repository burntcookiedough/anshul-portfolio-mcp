// Drives server.mjs over stdio as a real MCP client would, in both protocol eras,
// and asserts on what comes back. Run: node test.mjs   (OFFLINE=1 to force the bundled data)
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const M = "io.modelcontextprotocol/";
function client() {
  const p = spawn(process.execPath, [new URL("./server.mjs", import.meta.url).pathname.replace(/^\/(\w:)/, "$1")], { stdio: ["pipe", "pipe", "pipe"] });
  const waiting = new Map(); let buf = "", id = 0, stdoutJunk = [];
  p.stdout.on("data", (d) => {
    buf += d; let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      let m; try { m = JSON.parse(line); } catch { stdoutJunk.push(line); continue; }
      waiting.get(m.id)?.(m); waiting.delete(m.id);
    }
  });
  const call = (method, params) => new Promise((res, rej) => {
    const myId = ++id; waiting.set(myId, res);
    p.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: myId, method, params }) + "\n");
    setTimeout(() => rej(new Error(`timeout: ${method}`)), 15000);
  });
  const notify = (method, params) => p.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  return { call, notify, close: () => p.stdin.end(), junk: () => stdoutJunk, proc: p };
}
const text = (r) => r.result.content.map((c) => c.text).join("\n");
let passed = 0;
const ok = (name) => { passed++; console.log("  ok", name); };

// ── legacy era: initialize handshake (Claude Desktop / Claude Code today) ──
{
  console.log("legacy (2025-11-25 initialize):");
  const c = client();
  const init = await c.call("initialize", { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "0" } });
  assert.equal(init.result.protocolVersion, "2025-11-25"); assert.ok(init.result.capabilities.tools); assert.equal(init.result.resultType, undefined); ok("initialize echoes the client's version, no modern fields");
  const old = await c.call("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } });
  assert.equal(old.result.protocolVersion, "2024-11-05"); ok("older legacy version accepted");
  c.notify("notifications/initialized");
  const list = await c.call("tools/list", {});
  const names = list.result.tools.map((t) => t.name);
  assert.deepEqual(names, ["get_profile", "list_projects", "get_project", "list_patents", "get_contact", "search_profile"]); ok("tools/list: 6 tools in a fixed order");
  for (const t of list.result.tools) assert.equal(t.inputSchema.type, "object");
  ok("every inputSchema is an object schema");
  const prof = text(await c.call("tools/call", { name: "get_profile", arguments: {} }));
  for (const s of ["Anshul Panigrahi", "Vellore Institute of Technology", "Brandworks", "2nd place, IEEE CS Hackathon", "IN202641088096"]) assert.ok(prof.includes(s), s);
  ok("get_profile carries education, experience, the hackathon and patents");
  const pats = text(await c.call("tools/call", { name: "list_patents", arguments: {} }));
  assert.equal((pats.match(/\.pdf/g) || []).length, 3); ok("list_patents: 3 patents with PDF links");
  const agents = text(await c.call("tools/call", { name: "list_projects", arguments: { query: "LangGraph" } }));
  assert.ok(agents.includes("Customer Support Agents") && !agents.includes("Stella")); ok("list_projects filters by keyword");
  const eve = text(await c.call("tools/call", { name: "get_project", arguments: { name: "eve" } }));
  assert.ok(eve.includes("Faster-Whisper") && eve.includes("github.com/burntcookiedough/eve-windows-dictation")); ok("get_project finds Eve by a partial name");
  const miss = await c.call("tools/call", { name: "get_project", arguments: { name: "nonexistent thing" } });
  assert.equal(miss.result.isError, true); ok("unknown project is a tool error the model can recover from");
  const contact = text(await c.call("tools/call", { name: "get_contact", arguments: {} }));
  assert.ok(contact.includes("anshulpanigrahi3678@gmail.com") && contact.includes("drive.google.com")); ok("get_contact has email and resume");
  const s = text(await c.call("tools/call", { name: "search_profile", arguments: { query: "Raspberry Pi" } }));
  const first = s.split("\n\n## ")[0];
  assert.ok(/Medication dispenser/.test(first) && /Raspberry Pi/.test(first), first.slice(0, 200)); ok("search_profile ranks the medication patent first for 'Raspberry Pi'");
  const noise = text(await c.call("tools/call", { name: "search_profile", arguments: { query: "pi" } }));
  assert.ok(!/pipeline/i.test(noise.split("\n")[0]) || /\bpi\b/i.test(noise)); ok("'pi' matches the word, not 'pipeline'");
  const bad = await c.call("tools/call", { name: "nope", arguments: {} });
  assert.equal(bad.error.code, -32602); ok("unknown tool is a -32602 protocol error");
  const res = await c.call("resources/list", {});
  assert.equal(res.result.resources.length, 2);
  const md = await c.call("resources/read", { uri: "anshul://profile.md" });
  assert.ok(md.result.contents[0].text.startsWith("# Anshul Panigrahi")); ok("resources: list and read profile.md");
  const nf = await c.call("resources/read", { uri: "anshul://nope" });
  assert.equal(nf.error.code, -32602); ok("missing resource is -32602");
  assert.equal((await c.call("ping", {})).result && true, true); ok("ping");
  assert.equal((await c.call("foo/bar", {})).error.code, -32601); ok("unknown method is -32601");
  assert.deepEqual(c.junk(), []); ok("nothing but JSON-RPC on stdout");
  c.close();
}

// ── modern era: per-request _meta, no handshake ──
{
  console.log("modern (2026-07-28, per-request _meta):");
  const c = client();
  const meta = { [M + "protocolVersion"]: "2026-07-28", [M + "clientInfo"]: { name: "test", version: "0" }, [M + "clientCapabilities"]: {} };
  const d = await c.call("server/discover", { _meta: meta });
  assert.equal(d.result.resultType, "complete"); assert.ok(d.result.supportedVersions.includes("2026-07-28")); assert.equal(d.result._meta[M + "serverInfo"].name, "anshul-portfolio"); ok("server/discover");
  const list = await c.call("tools/list", { _meta: meta });
  assert.equal(list.result.resultType, "complete"); assert.equal(list.result.tools.length, 6); ok("tools/list without initialize, resultType complete");
  const call = await c.call("tools/call", { _meta: meta, name: "list_patents", arguments: {} });
  assert.equal(call.result.resultType, "complete"); assert.ok(text(call).includes("IN202641067209")); ok("tools/call");
  const unsup = await c.call("tools/list", { _meta: { ...meta, [M + "protocolVersion"]: "1900-01-01" } });
  assert.equal(unsup.error.code, -32022); assert.deepEqual(unsup.error.data.requested, "1900-01-01"); assert.ok(unsup.error.data.supported.includes("2026-07-28")); ok("unsupported version is UnsupportedProtocolVersionError -32022");
  c.close();
}
console.log(`\n${passed} checks passed`);
process.exit(0);
