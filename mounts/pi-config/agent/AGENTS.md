# AGENTS.md — Global Operating Rules

## User

- Name: Kevin
- Primary goal: prototype 2D game loops, discover unique ideas, and ship complete games

## Environment

This agent runs inside a **Docker container**. Host directories are mounted under `/app/`. Host owns a pi-config directory that is mounted under `/root/.pi`.

| Mount path | Role |
|---|---|
| `/app/workspace/` | **Projects live here.** Create game prototypes and shippable work under this tree. |
| `/app/memory/sqlite` | **Persistent memory.** SQLite database for contextual congruence across models and sessions. |
| `/root/.pi/` | **Pi home (`~/.pi`).** Auth, settings, sessions, agent config.
| `/app/suggestions/` | **Improvement proposals.** Write proposals into provided Dockerfile duplicates for upgrading the environment. He will review and apply later on the host. |
| `/app/obsidian/` | Host mounted Obsidian vault for collaborative note read/writes. |
| `/app/pi-credentials/` | **Environment credentials.** Host mounted credentials for Pi agent.  Protect agent identity, these are private keys so never expose them. Use only for authenticating operations. |

## Standing rules

1. **Projects** — All game/work projects go in `/app/workspace/`. Do not scatter project source into other mounted directories.
2. **Memory DB** — Maintain and use the SQLite database for durable project memory: decisions, architecture, notable outcomes, task history, and other information that improves continuity.
3. **Persistence policy** Only persist information when it provides future value. Do not create databases, notes, logs, or memories for routine, temporary, or low-value interactions.
4. **Config snapshot** — Keep `/root/.pi/pi-state.json` current with a readable snapshot of active Pi config (settings, notable paths, models, etc.). Update it whenever the Pi confiugration is modified or extensions are added.
5. **Suggestions** — Edit Dockerfiles or write markdowns alongside the provided files with suggestions to improveme the environment in `/app/suggestions/`.  Only do so **when Kevin explicitly requests these actions**.
6. **AGENTS.md edits** - Any edits to this file must append the date at the end of the line.

## Working posture for 2D game work

- Favor small, runnable prototypes and tight game loops over large frameworks up front.
- Scaling to shippable products will be explicitly incremental unless otherwise stated.

## Kevin's Self Written Preferences
- Hello, I'm a fan of concise and effective conversational flow.
- I enjoy collaborative reasoning.
- When comparing, prioritize tradeoffs.
- Correct misconceptions directly.
- Excalidraw style representations are my go-to for mental models, system interactions, explanations, and idea sculpting.

# Host Hardware/Software
- System: Macbook Pro M3 Ultra
- Config/Preferences: Ghostty, AeroSpace, Karabiner, Hammerspoon, FireFox(Zen), Obsidian, Godot, Reaper, Pixelorama
- Provider: OpenRouter
- Harness: Pi Containerized

# Personal Skills
- Music Production/Mixing/Mastering [professional level]

## **WELCOME**