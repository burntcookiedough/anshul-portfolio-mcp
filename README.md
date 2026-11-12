# Anshul Panigrahi, as an MCP server

Ask your AI assistant about me directly. This is a small [Model Context Protocol](https://modelcontextprotocol.io) server that gives any MCP client (Claude Code, Claude Desktop, Cursor, VS Code and others) my profile, projects, published patents and contact details as tools.

It reads live from my portfolio at **https://burntcookiedough.github.io/**, so answers stay current, and falls back to a bundled copy when offline. No dependencies, no API keys, nothing to configure.

## Add it

**Claude Code**

```
claude mcp add anshul -- npx -y github:burntcookiedough/anshul-portfolio-mcp
```

**Claude Desktop, Cursor and other clients** (add to the `mcpServers` section of the client's config):

```json
{
  "mcpServers": {
    "anshul": {
      "command": "npx",
      "args": ["-y", "github:burntcookiedough/anshul-portfolio-mcp"]
    }
  }
}
```

Requires Node.js 18 or later.

## Then ask

- "Who is Anshul Panigrahi and what is he looking for?"
- "Has he built anything with agents or LangGraph?"
- "Show me his patents and link the full documents."
- "Would he fit an AI engineering internship working on tool-using agents? What evidence is there?"

## Tools

| Tool | Returns |
| --- | --- |
| `get_profile` | Headline, summary, education, experience, achievements, certifications, skills, links |
| `list_projects` | Every project with stack and link; optional keyword filter |
| `get_project` | Full detail on one project (partial names work: "eve", "stella") |
| `list_patents` | The three published Indian patent applications, with links to the official PDFs |
| `get_contact` | Email, portfolio, GitHub, LinkedIn, resume |
| `search_profile` | Matching sections of the profile for any word or phrase |

All tools are read-only. Two resources are also exposed: `anshul://profile.md` (the whole profile as Markdown) and `anshul://resume.json` ([JSON Resume](https://jsonresume.org)).

## Protocol

Speaks MCP `2026-07-28` (per-request metadata, `server/discover`) and the earlier `initialize`-based versions back to `2024-11-05`, over stdio.

```
npm test          # drives the server in both protocol eras and checks every tool
```

## Contact

anshulpanigrahi3678@gmail.com · [Portfolio](https://burntcookiedough.github.io/) · [LinkedIn](https://linkedin.com/in/anshul-panigrahi22) · [GitHub](https://github.com/burntcookiedough)
