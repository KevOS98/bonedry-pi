# BareBones Docker Pi-Agent Container
Simple Docker container configuration for Pi Agent. Cross session durable memory, Pi configuration, plugins, projects, extensions, and credentials. 

# ReadMe

This is a minimal configuration for using Pi Agent in a Docker container while retaining 99% of the user level self improving benefits that make Pi so great.

The goal of this architecture is maximizing three things: agent capability, security, and simplicity. It is the closest to blank Pi configuration with simple permanence states across containers that I could design, while most importantly retaining isolation and the appeal of an agent handling all self-improvements, and that does mean all.

The core functionality of this architecture relies only on SQLite and specific volume mounts. The dockerfile & compose.yml create and bind 7 mounts that enable the desired functionality. The simplicity means most models will handle this extremely well given adequate competency (not a quantized to hell potatoe).

The current repo configuration includes a custom AGENTS.md that serves as an instruction template for models to use this architecture. You must manually update this to fit your personal preferences, but current template is built for the widest range of model capability.

Checkout the compose.yml, Dockerfile, and .gitignore for the full directory mount list in the repo and create them before running docker compose. They are listed below as well.

# Mount Layout: 
1. pi-agent/mounts/pi-config:/root/.pi
- This provides permanent direct access to the agent's configuration from host to the container.  It will retain any self edits Pi does to config, extensions applied, and plugin installs on the host through all sessions.

2. pi-agent/mounts/memory/sqlite:/app/memory/sqlite
- SQLiteDB is used to keep simply defined context logs across sessions. Sqlite3 is installed on init from Dockerfile.
- Persistence is defined in AGENTS.md to guard against memory hoarding.

3. pi-agent/mounts/suggestions:/app/suggestions
- Suggestions/ contains manually maintained copies of current host dockerfile and compose.yml so Pi can propose revisions to improve the environment from host-side view, effectively giving the agent complete system awareness.

4. pi-agent/mounts/workspace:/app/workspace
- Pi will hold all work in /app/workspaces unless explicitly told otherwise.

5. pi-agent/mounts/obsidianvaultpi:/app/obsidian
- The obsidian vault is a collaboritve space for note read/write between host and container.

6. pi-agent/mounts/pi-credentials:/app/pi-credentials
- Pi-credentials/ contents are up to personal discretion, but they can hold any keys that enable authentication operations for the agent's identity.

7. pi-agent/mounts/pi-credentials/ssh:/root/.ssh
- This mount is included for container git auth if you decide to put ssh keys under credentials. I also personally have gitconfig info for Pi in a markdown here as well.

# QuickStart

1. Clone the repo

2. Run: mkdir -p mounts/pi-config/agent mounts/memory/sqlite/ mounts/suggestions/ mounts/workspace/ /mounts/obsidianvaultpi/ mounts/pi-credentials/

3. Manually read and update the AGENTS.md, this file goes in mounts/pi-config/agent when you're done.

4. cd back into pi-agent/ and run: cp .env.example .env

5. Edit .env and replace your key for safe container injection

6. Run the Docker container to your preferences

- Bonus = installing pi-web-access is recommended from the official packages docs on first docker instance

# Parting Widsoms

- If you're considering riding the YOLO wave like I was before making this, remember that it only takes a single moment for something to blast your machine or expose your information. The only true container limitation here is the amount of bloat driven from initialization (which is low as possible) and the need to manually implement suggestions/. The setup time is a worthy moat between potential disaster and your machine, and if you've stumbled upon this then I've done it for you :D.

- Remember that Pi can autonomously handle building layers of increasing complexity on top of this architecture, if you choose so. These initial settings are meant to be simple enough for the widest range of models to handle and follow. This does mean that the AGENTS.md may need to be tailored if you're running significantly incapable models, so provide the repo as context and consult a free frontier model like claude to tailor it accordingly.

- I'm probably gonna add some cool bone icon to load in new sessions at some point stay tuned.

# If you're switching from a YOLO setup, you can just prompt Pi to set this up for you and explain your next steps.  Probably worth a quick evaluation from a trusted LLM to see if it's a good fit for your workflow.
