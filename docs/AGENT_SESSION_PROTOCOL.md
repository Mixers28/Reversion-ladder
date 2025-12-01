# Agent Session Protocol

Version: 1.0  
Owner: You  
Agents: Any code assistant (e.g. VS Code Code Agent), optional external assistant (Nova, ChatGPT, etc.)

---

## 0. Purpose

Define **how sessions start, how context is loaded, and how sessions end** when working on this project with AI agents.

The goal:

- Agents always share the same context.
- Docs remain accurate and in sync.
- Every session leaves a clear trail in `SESSION_NOTES.md`.
- Git commits act as checkpoints.

---

## 1. Files Used as Memory

- `docs/PROJECT_CONTEXT.md` → long-term memory (LTM)
- `docs/NOW.md` → working memory (WM)
- `docs/SESSION_NOTES.md` → session memory (SM)
- `docs/MCP_LOCAL_DESIGN.md` → conceptual design for this system
- `docs/AGENT_SESSION_PROTOCOL.md` → this file (rules)

Agents should read these before doing significant work.

---

## 2. Start Session Protocol

Run the **“Start Session (Agent)”** task (see `.vscode/tasks.json`), which executes:

```powershell
pwsh ./scripts/session-helper.ps1 -Mode Start -OpenDocs

This will:

Show the current Git branch.

Print a SESSION START prompt tailored for the code agent.

Optionally open the core docs in VS Code.

You then:

Copy the printed SESSION START block.

Paste it into your local code assistant (e.g., VS Code Code Agent).

Let the agent:

Read PROJECT_CONTEXT.md, NOW.md, SESSION_NOTES.md.

Summarise current context in 3–6 bullets.

Wait for your instructions.