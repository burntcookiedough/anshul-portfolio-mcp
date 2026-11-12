#!/usr/bin/env node
// Anshul Panigrahi's portfolio as an MCP server (stdio, no dependencies).
//
// Speaks both MCP eras:
//   modern  (2026-07-28): per-request _meta, server/discover, resultType on results
//   legacy  (2025-11-25 and earlier): the initialize handshake
//
// Data comes live from https://burntcookiedough.github.io/ (resume.json, profile.md),
// so it never goes stale; a bundled snapshot is used when the network is unavailable.

import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

const SITE = "https://burntcookiedough.github.io/";
const NAME = "anshul-portfolio";
const VERSION = "1.0.0";
const MODERN = ["2026-07-28"];
const LEGACY = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const META = "io.modelcontextprotocol/";
const INSTRUCTIONS =
  "Answers questions about AI engineer Anshul Panigrahi: profile, projects, patents, experience, skills and contact. " +
  "Start with get_profile for an overview; use list_projects / get_project and list_patents for detail; search_profile for anything specific. " +
  "Everything returned is public information from his portfolio.";

const log = (...a) => process.stderr.write(`[${NAME}] ${a.join(" ")}\n`);
const bundled = (f) => readFileSync(new URL(`./data/${f}`, import.meta.url), "utf8");

// ───────────── data ─────────────
let cache = null;
async function load() {
  if (cache && Date.now() - cache.at < 10 * 60 * 1000) return cache;
  const get = async (f, as) => {
    try {
      const r = await fetch(SITE + f, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error(`${r.status}`);
      return as === "json" ? await r.json() : await r.text();
    } catch (e) {
      log(`live ${f} unavailable (${e.message}); using bundled copy`);
      return as === "json" ? JSON.parse(bundled(f)) : bundled(f);
    }
  };
  const [resume, md] = await Promise.all([get("resume.json", "json"), get("profile.md", "text")]);
  cache = { resume, md, at: Date.now() };
  return cache;
}

// profile.md split into its "## " and "### " sections, for search
function sections(md) {
  const out = [];
  let cur = null, parent = "";
  for (const line of md.split("\n")) {
    const h = line.match(/^(#{2,3}) (.+)/);
    if (h) {
      if (h[1] === "##") parent = h[2];
      cur = { title: h[1] === "##" ? h[2] : `${parent} > ${h[2]}`, lines: [] };
      out.push(cur);
    } else if (cur) cur.lines.push(line);
  }
  return out.map((s) => ({ title: s.title, text: s.lines.join("\n").trim() })).filter((s) => s.text);
}
const norm = (s) => String(s || "").toLowerCase();
const findProject = (r, name) => {
  const q = norm(name);
  return r.projects.find((p) => norm(p.name) === q) || r.projects.find((p) => norm(p.name).includes(q) || q.includes(norm(p.name).split(/[ —-]/)[0]));
};

// ───────────── tools ─────────────
const ro = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };
const TOOLS = [
  {
    name: "get_profile",
    title: "Profile overview",
    description: "Who Anshul Panigrahi is: headline, summary, what he is looking for, education, experience, achievements, certifications and links.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: ro,
    async run() {
      const { resume: r } = await load();
      const b = r.basics;
      return [
        `# ${b.name}`, `${b.label}. ${b.location.city}, India.`, "", b.summary, "",
        "## Education", ...r.education.map((e) => `- ${e.studyType} in ${e.area}, ${e.institution} (${e.startDate} to ${e.endDate}), CGPA ${e.score}`),
        "", "## Experience", ...r.work.flatMap((w) => [`- ${w.position}, ${w.name} (${w.startDate} to ${w.endDate})`, ...w.highlights.map((h) => `  - ${h}`)]),
        "", `## Projects (${r.projects.length}): ${r.projects.map((p) => p.name).join("; ")}`,
        `## Published patent applications (${r.publications.length}): ${r.publications.map((p) => p.name).join("; ")}`,
        "", "## Achievements", ...r.awards.map((a) => `- ${a.title} (${a.date}): ${a.summary}`),
        "", "## Certifications", ...r.certificates.map((c) => `- ${c.name}, ${c.issuer} (${c.date})`),
        "", "## Skills", ...r.skills.map((s) => `- ${s.name}: ${s.keywords.join(", ")}`),
        "", `Portfolio: ${b.url} · Email: ${b.email} · ${b.profiles.map((p) => `${p.network}: ${p.url}`).join(" · ")}`,
      ].join("\n");
    },
  },
  {
    name: "list_projects",
    title: "List projects",
    description: "Anshul's projects with a one-line description, tech stack and link. Optionally filter by a keyword such as 'agents', 'LangGraph', 'computer vision' or 'CUDA'.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "Optional keyword to filter by (matches name, description and stack)" } }, additionalProperties: false },
    annotations: ro,
    async run({ query } = {}) {
      const { resume: r } = await load();
      const q = norm(query);
      const hits = r.projects.filter((p) => !q || norm([p.name, p.description, p.keywords.join(" "), p.highlights.join(" ")].join(" ")).includes(q));
      if (!hits.length) return `No project matches "${query}". Projects: ${r.projects.map((p) => p.name).join("; ")}`;
      return hits.map((p) => `- **${p.name}**: ${p.description}\n  Stack: ${p.keywords.join(", ")}${p.url ? `\n  Link: ${p.url}` : "\n  (private repository, available on request)"}`).join("\n");
    },
  },
  {
    name: "get_project",
    title: "Project detail",
    description: "Full detail on one project: what it does, why it matters, stack and links. Pass the project name (partial names work, e.g. 'Eve', 'Stella', 'Veri-Dose').",
    inputSchema: { type: "object", properties: { name: { type: "string", description: "Project name or part of it" } }, required: ["name"], additionalProperties: false },
    annotations: ro,
    async run({ name }) {
      const { resume: r, md } = await load();
      const p = findProject(r, name);
      if (!p) throw new ToolError(`No project called "${name}". Projects: ${r.projects.map((x) => x.name).join("; ")}`);
      const sec = sections(md).find((s) => s.title.startsWith("Projects >") && norm(s.title).includes(norm(p.name)));
      return sec ? `## ${p.name}\n${sec.text}` : `## ${p.name}\n${p.description}\nWhy it matters: ${p.highlights.join(" ")}\nStack: ${p.keywords.join(", ")}${p.url ? `\nLink: ${p.url}` : ""}`;
    },
  },
  {
    name: "list_patents",
    title: "Published patents",
    description: "Anshul's published Indian patent applications (co-inventor): number, title, publication date, a plain-language summary and a link to the full official PDF.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: ro,
    async run() {
      const { resume: r } = await load();
      return r.publications.map((p) => `- **${p.name}**\n  Published ${p.releaseDate} by ${p.publisher}\n  ${p.summary}\n  Full document: ${p.url}`).join("\n");
    },
  },
  {
    name: "get_contact",
    title: "Contact and links",
    description: "How to reach Anshul and where to find his resume, portfolio, GitHub and LinkedIn.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: ro,
    async run() {
      const { resume: r, md } = await load();
      const b = r.basics;
      const resume = (md.match(/Resume \(PDF\): (\S+)/) || [])[1];
      return [`Email: ${b.email}`, `Portfolio: ${b.url}`, ...b.profiles.map((p) => `${p.network}: ${p.url}`), resume ? `Resume (PDF): ${resume}` : "", `Looking for: AI engineering internships with product teams shipping LLM features, agents and tool use.`].filter(Boolean).join("\n");
    },
  },
  {
    name: "search_profile",
    title: "Search the profile",
    description: "Search everything in Anshul's profile (projects, patents, experience, skills, education) for a word or phrase and return the matching sections.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "Word or phrase, e.g. 'RAG', 'YOLO', 'Raspberry Pi', 'hackathon'" } }, required: ["query"], additionalProperties: false },
    annotations: ro,
    async run({ query }) {
      const { md } = await load();
      const phrase = norm(query).trim();
      const words = phrase.split(/\s+/).filter(Boolean);
      if (!words.length) throw new ToolError("query is empty");
      const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // the whole phrase counts most, then whole words; "pi" must not match "pipeline"
      const score = (t) => (t.includes(phrase) ? 10 : 0) + words.filter((w) => new RegExp(`(^|[^a-z0-9])${esc(w)}($|[^a-z0-9])`).test(t)).length;
      const hits = sections(md).map((s) => ({ ...s, score: score(norm(s.title + " " + s.text)) })).filter((s) => s.score).sort((a, b) => b.score - a.score).slice(0, 5);
      return hits.length ? hits.map((s) => `## ${s.title}\n${s.text}`).join("\n\n") : `Nothing in the profile mentions "${query}".`;
    },
  },
];

const RESOURCES = [
  { uri: "anshul://profile.md", name: "profile.md", title: "Full profile (Markdown)", description: "The whole portfolio as one Markdown document", mimeType: "text/markdown" },
  { uri: "anshul://resume.json", name: "resume.json", title: "Resume (JSON Resume)", description: "Structured resume in JSON Resume format", mimeType: "application/json" },
];

class ToolError extends Error {}
class RpcError extends Error { constructor(code, message, data) { super(message); this.code = code; this.data = data; } }

// ───────────── protocol ─────────────
async function handle(method, params = {}, era) {
  switch (method) {
    case "initialize": {
      const asked = params.protocolVersion;
      return {
        protocolVersion: LEGACY.includes(asked) ? asked : LEGACY[0],
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: NAME, title: "Anshul Panigrahi, portfolio", version: VERSION },
        instructions: INSTRUCTIONS,
      };
    }
    case "server/discover":
      return { supportedVersions: [...MODERN, ...LEGACY], capabilities: { tools: {}, resources: {} }, _meta: { [META + "serverInfo"]: { name: NAME, version: VERSION } }, instructions: INSTRUCTIONS };
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS.map(({ run, ...t }) => t) };
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) throw new RpcError(-32602, `Unknown tool: ${params.name}`);
      try {
        return { content: [{ type: "text", text: await tool.run(params.arguments || {}) }], isError: false };
      } catch (e) {
        if (e instanceof ToolError) return { content: [{ type: "text", text: e.message }], isError: true };
        throw e;
      }
    }
    case "resources/list":
      return { resources: RESOURCES };
    case "resources/read": {
      const res = RESOURCES.find((r) => r.uri === params.uri);
      if (!res) throw new RpcError(-32602, "Resource not found", { uri: params.uri });
      const { resume, md } = await load();
      return { contents: [{ uri: res.uri, mimeType: res.mimeType, text: res.name === "profile.md" ? md : JSON.stringify(resume, null, 2) }] };
    }
    case "prompts/list":
      return { prompts: [] };
    case "resources/templates/list":
      return { resourceTemplates: [] };
    default:
      throw new RpcError(-32601, `Method not found: ${method}`);
  }
}

const send = (msg) => process.stdout.write(JSON.stringify(msg) + "\n");

async function onMessage(msg) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return;
  const isRequest = msg.id !== undefined && msg.id !== null;
  if (!isRequest) return; // notifications (initialized, cancelled, ...) need no reply
  const meta = (msg.params && msg.params._meta) || {};
  const version = meta[META + "protocolVersion"];
  const modern = version !== undefined && msg.method !== "initialize";
  try {
    if (modern && !MODERN.includes(version)) {
      throw new RpcError(-32022, "Unsupported protocol version", { supported: [...MODERN, ...LEGACY], requested: version });
    }
    const result = await handle(msg.method, msg.params || {}, modern ? "modern" : "legacy");
    send({ jsonrpc: "2.0", id: msg.id, result: modern ? { resultType: "complete", ...result } : result });
  } catch (e) {
    const err = e instanceof RpcError ? { code: e.code, message: e.message, ...(e.data ? { data: e.data } : {}) } : { code: -32603, message: `Internal error: ${e.message}` };
    if (!(e instanceof RpcError)) log(e.stack || e);
    send({ jsonrpc: "2.0", id: msg.id, error: err });
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); return; }
  onMessage(msg);
});
rl.on("close", () => process.exit(0));
log(`ready (MCP ${MODERN[0]} and ${LEGACY.join(", ")})`);
