# AI Agent Memory & Core Guidelines

> **CRITICAL INSTRUCTION:** This memory file must be consulted and adhered to at the start of every session or task execution.

## 1. Project Overview & Context
- **Workspace:** `/Users/linusleong/Desktop/Antigravity notebook`
- **Environment:** macOS, Node.js / Python (venv present), VS Code.
- **Purpose:** Notebook / Workspace project with custom scripts and documentation.

## 2. Core Operational Rules & Conventions
- **Always gather context:** Inspect the codebase, check existing files, frameworks, and naming conventions before starting work.
- **Use absolute paths:** Always refer to files using absolute paths (e.g., `/Users/linusleong/Desktop/Antigravity notebook/...`).
- **No direct terminal commands:** For all prompt requests, **do not run commands directly at the terminal** unless explicitly authorized or necessary per instructions.
- **Parallelism & Tool Usage:** Emit independent tool calls together (reads, searches, commands, edits). Do not split independent checks across separate turns unnecessarily.
- **Validation:** Always validate new code, unit tests, or edits by running tests or checks where possible before finishing.
- **Code Quality:** Provide complete, functional code without placeholders or omissions, matching existing styles.

## 3. Persistent Notes & Learnings
- **Concision:** When reporting info, be concise and sacrificing grammar for concision.
