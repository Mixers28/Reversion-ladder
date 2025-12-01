# local-mcp-context-kit  
A lightweight, editor-friendly framework for using **plain Markdown files + Git** as a persistent “project memory” for human + AI collaboration.

This kit is **inspired by patterns emerging across the AI coding ecosystem**, such as:

- `PROJECT_CONTEXT.md` used in Claude/Cursor workflows  
- Markdown-based session logs (`SESSION_NOTES.md`)  
- The structured “context hydration / writeback” cycles described in Model Context Protocol (MCP)  
- Multi-file memory systems described by early users of code assistants  

This repository packages these ideas into a **clean, reusable structure** that works with any LLM-powered coding agent (e.g. VS Code Code Agent, ChatGPT, Cursor, Claude).

No cloud services. No servers.  
Just **files, Git, and a consistent workflow**.

---

## ⭐ What this kit provides

### ✔ Long-Term Memory (LTM)
`docs/PROJECT_CONTEXT.md`  
High-level design, architecture, constraints — the source of truth.

### ✔ Working Memory (WM)
`docs/NOW.md`  
Current sprint / focus. Updated frequently.

### ✔ Session Memory (SM)
`docs/SESSION_NOTES.md`  
Append-only log describing each development session.

### ✔ Agent Protocol
`docs/AGENT_SESSION_PROTOCOL.md`  
Defines how humans + AI agents coordinate:  
how sessions start, how context is loaded, how sessions end.

### ✔ Local MCP Design
`docs/MCP_LOCAL_DESIGN.md`  
Explains the layered memory model and how it maps to MCP-like concepts.

---

## ⭐ Why this exists

AI tools today don’t maintain persistent project memory unless you:

- keep giving them context manually, or  
- depend on proprietary cloud memory features, or  
- build a full MCP server.

This template offers a **simple, transparent alternative**:

> Use version-controlled Markdown files as the durable memory layer.

This pattern is already used informally across GitHub, Reddit, and Claude/Cursor communities — this kit just **organises it** and gives you:

- start/end session scripts  
- VS Code tasks  
- summary blocks  
- commit+push integration  
- branch-aware session notes  

So your workflow becomes consistent and reproducible.

---

## 🚀 Getting Started

### 1. Clone the template

```bash
git clone https://github.com/YOUR_USERNAME/local-mcp-context-kit
cd local-mcp-context-kit

(Or use “Use this template” on GitHub.)

2. Fill in your project details

Edit:

docs/PROJECT_CONTEXT.md

docs/NOW.md

Do NOT manually edit the summary blocks — they are for your code agent to maintain.

3. Start a session

In VS Code:

Ctrl+Shift+P → Tasks: Run Task

Select “Start Session (Agent)”

A SESSION START prompt appears in the terminal.

Paste that prompt into your AI coding agent (VS Code Code Agent or similar).

The agent loads context and waits for instructions.

4. End a session

Ctrl+Shift+P → Tasks: Run Task

Select “End Session (Agent + Commit)”

A SESSION END prompt appears.

You paste it into the AI agent and describe the work you did.

The agent updates:

SESSION_NOTES.md

NOW.md

Summary blocks

Return to the terminal → press Enter → changes are committed and pushed.

This is your context writeback cycle.

🧠 Architecture Overview (MCP-Inspired)

This kit defines four memory layers:

LTM – PROJECT_CONTEXT.md

WM – NOW.md

SM – SESSION_NOTES.md

IM – future: indexes, embeddings, etc.

And two session events:

Context Hydration → session start

Memory Writeback → session end

This mirrors concepts from MCP but stays completely local and editor-native.

🛠 Tooling Provided
VS Code tasks

Located in .vscode/tasks.json:

Start Session (Agent)

End Session (Agent + Commit)

PowerShell scripts

Under scripts/:

session-helper.ps1 → prints prompts, opens docs, triggers workflow

commit-session.ps1 → commits & pushes using current branch

Works on Windows, macOS, and Linux (with PowerShell Core).

🏷 Project Status

Early, but stable.
Used actively in personal development workflows.

🕊 License

MIT License (feel free to choose another).

🙏 Credits & Inspiration

This project is influenced by public patterns shared across:

Claude community project_context workflows

Cursor session memory approaches

MCP’s “external context” ideas

Developers using Markdown as persistent project state

Early AI-assisted coding blog posts and repos

This kit organises and extends those patterns into a clean, reusable structure.


---

# 2️⃣ GitHub description + tags

### **Description**
> A lightweight, editor-friendly framework that uses Markdown files + Git as persistent project memory for human + AI coding agents. Inspired by Claude/Cursor project_context patterns and MCP-style context workflows.

### **Tags**


mcp
context
ai
llm
vscode
cursor
claude
chatgpt
memory
project-context
session-notes
developer-tools
workflow


---

# 3️⃣ Initial commit message



Initial commit – local MCP-style context kit

Added PROJECT_CONTEXT, NOW, SESSION_NOTES (LTM/WM/SM)

Added AGENT_SESSION_PROTOCOL and MCP_LOCAL_DESIGN docs

Added session-helper and commit-session scripts

Added VS Code tasks for start/end session

Ready for public release