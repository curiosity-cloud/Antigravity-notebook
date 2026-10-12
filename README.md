# NotebookLM MCP Integration for Antigravity

This workspace is configured with the **NotebookLM MCP Server** (`notebooklm-mcp-server` v4.0.2) to allow Antigravity to interact directly with Google NotebookLM (Gemini Notebook).

---

## 1. Quick Setup & One-Time Authentication

To allow the MCP server to interact with your NotebookLM account, run the interactive Google login flow:

```bash
npm run auth
# or:
npx notebooklm-mcp-server auth
```

1. A Chromium browser window will open.
2. Sign in to the Google account you use with NotebookLM.
3. Once your notebook list loads in the browser, your session cookies (including `__Secure-1PSIDTS`) will be automatically saved to `~/.notebooklm-mcp/auth.json`.
4. Close the browser window.

> [!TIP]
> If your Google session expires in the future, simply run `npm run auth` again. In Antigravity, you can then invoke the `refresh_auth` tool or reload MCP servers to refresh without reconfiguration.

---

## 2. MCP Server Configuration

The MCP server is registered in this workspace at:
- [`.agents/mcp_config.json`](file:///.agents/mcp_config.json)
- [`.agents/plugins/notebooklm/mcp_config.json`](file:///.agents/plugins/notebooklm/mcp_config.json)

```json
{
  "mcpServers": {
    "notebooklm": {
      "command": "npx",
      "args": ["-y", "notebooklm-mcp-server", "start"],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    }
  }
}
```

---

## 3. Available Tools & Workflows

Once authenticated, Antigravity has access to the full suite of NotebookLM tools:

### 📒 Creating & Managing Notebooks
- `notebook_create`: Create a new notebook with a given title.
- `notebook_list`: List all existing notebooks and metadata.
- `notebook_get`: Fetch details and source IDs for a specific notebook.
- `notebook_rename`: Rename an existing notebook.
- `notebook_delete`: Remove a notebook (requires confirmation).

### 🖇️ Adding Sources
- `notebook_add_url`: Add a website or YouTube video as a source.
- `notebook_add_local_file`: Upload local PDF, TXT, or Markdown documents.
- `notebook_add_text`: Ingest raw text or notes directly.
- `notebook_add_drive`: Attach Google Drive documents.

### 💬 Querying & Chat
- `notebook_query`: Ask grounded questions against notebook sources with full citations.
- `notebook_summarize`: Generate an AI notebook guide with key summaries and suggested follow-ups.
- `source_get_guide`: Retrieve an AI summary and key topics for an individual source.
- `chat_history_get`: Retrieve prior Q&A exchanges.

### 🎙️ Studio & Research Extras
- `audio_overview_create`: Generate podcast-style Audio Overviews (formats: deep dive, brief, critique, debate).
- `quiz_create` / `flashcards_create`: Generate interactive study materials.
- `report_create` / `slide_deck_create`: Generate formatted reports or presentations.
- `research_start` / `research_poll` / `research_import`: Trigger Fast or Deep Research into a notebook.
