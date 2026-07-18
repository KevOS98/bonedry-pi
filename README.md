<div align="center">

# BareBones Docker Pi-Agent Container

</div>

Simple Docker container configuration for Pi Agent. Cross session durable memory, Pi configuration, plugins, projects, extensions, and credentials. 

# ReadMe

This is a minimal configuration for using Pi Agent in a Docker container while retaining 99% of the user level self improving benefits that make Pi so great.

The goal of this architecture is maximizing three things: agent capability, security, and simplicity. It is the closest to blank Pi configuration with simple permanence states across containers that I could design, while most importantly retaining isolation and the appeal of an agent handling all self-improvements, and that does mean all.

The core functionality of this architecture relies only on SQLite and specific volume mounts. The dockerfile & compose.yml create and bind 7 mounts that enable the desired functionality. The simplicity means most models will handle this extremely well given adequate competency (not a quantized to hell potatoe).

The current repo configuration includes a custom AGENTS.md that serves as an instruction template for models to use this architecture. You must manually update this to fit your personal preferences, but current template is built for the widest range of model capability.

Checkout the compose.yml, Dockerfile, and .gitignore for the full directory mount list in the repo and create them before running docker compose. They are listed below as well.

# Mount Layout: 
1. bonedry-pi/mounts/pi-config:/root/.pi
- This provides permanent direct access to the agent's configuration from host to the container.  It will retain any self edits Pi does to config, extensions applied, and plugin installs on the host through all sessions.

2. bonedry-pi/mounts/memory/sqlite:/app/memory/sqlite
- SQLiteDB is used to keep simply defined context logs across sessions. Sqlite3 is installed on init from Dockerfile.
- Persistence is defined in AGENTS.md to guard against memory hoarding.

3. bonedry-pi/mounts/suggestions:/app/suggestions
- Suggestions/ contains manually maintained copies of current host dockerfile and compose.yml so Pi can propose revisions to improve the environment from host-side view, effectively giving the agent complete system awareness.

4. bonedry-pi/mounts/workspace:/app/workspace
- Pi will hold all work in /app/workspaces unless explicitly told otherwise.

5. bonedry-pi/mounts/obsidianvaultpi:/app/obsidian
- The obsidian vault is a collaboritve space for note read/write between host and container.

6. bonedry-pi/mounts/pi-credentials:/app/pi-credentials
* Not READ ONLY by default. Visit compose.yml and append :ro to this mount to apply READ ONLY permissions.
- Pi-credentials/ contents are up to personal discretion, but they can hold any keys that enable authentication operations for the agent's identity.

7. bonedry-pi/mounts/pi-credentials/ssh:/root/.ssh
* Should you choose to use this, mount a dedicated Pi SSH identity here, NOT your personal key!
* Not READ ONLY by default. Visit compose.yml and append :ro to this mount to apply READ ONLY permissions. I choose not to to prevent breaking known_hosts writes from Pi.
- This mount is included for container git auth if you decide to put ssh keys under credentials. I also personally have gitconfig info for Pi in a markdown here as well.

# QuickStart

*If you're switching from a YOLO setup, you can just prompt Pi to set this up for you and explain your next steps.  Probably worth a quick evaluation from a trusted LLM to see if it's a good fit for your workflow.*

**Prerequisites** Docker + Docker Compose installed

1. Clone the repo
```bash
git clone https://github.com/KevOS98/bonedry-pi.git
```

2. cd into bonedry-pi and run: mkdir -p ./mounts/pi-config/agent ./mounts/memory/sqlite ./mounts/suggestions ./mounts/workspace ./mounts/obsidianvaultpi ./mounts/pi-credentials
```bash
cd bonedry-pi
mkdir -p ./mounts/pi-config/agent \
         ./mounts/memory/sqlite \
         ./mounts/suggestions \
         ./mounts/workspace \
         ./mounts/obsidianvaultpi \
         ./mounts/pi-credentials/ssh
```

3. Manually read and update the AGENTS.md, this file goes in mounts/pi-config/agent/ when you're done.
```bash
cp AGENTS.md ./mounts/pi-config/agent/AGENTS.md
```

4. cd back into bonedry-pi/ and run: cp .env.example .env
```bash
cp .env.example .env
```

6. Edit .env and replace your provider and key for safe container injection

7. Run the Docker container to your preferences

- Bonus: installing pi-web-access is recommended from the official Pi Agent packages docs on first docker instance

# **IMPORTANT**

- This configuration has no built in health checks or resource limits by default. This is intentional for the philosophy of the environment.  They must be manually added or created under suggestions from the agent.

- This configuration enables Pi's default behavior of root system access to the built container. This provides the least level of friction for environment manipulation, as designed by the source. Non-root permissions may also be manually added or created under suggestions from the agent.

- This architecture assumes some knowledge about Docker containers. If you are confused, I suggest going over it with a model to fully grasp before launching. My rule of thumb is knowing every line's function in the Dockerfile and compose.yml.

# Parting Wisdoms

- If you're considering riding the YOLO wave like I was before making this, remember that it only takes a single moment for something to blast your machine or expose your information. The only true container limitation here is the amount of bloat driven from initialization (which is low as possible) and the need to manually implement suggestions/. The setup time is a worthy moat between potential disaster and your machine, and if you've stumbled upon this then I've done it for you :D.

- Remember that Pi can autonomously handle building layers of increasing complexity on top of this architecture, if you choose so. These initial settings are meant to be simple enough for the widest range of models to handle and follow. This does mean that the AGENTS.md may need to be tailored if you're running significantly incapable models, so provide the repo as context and consult a free frontier model like claude sonnet to tailor it accordingly.

- I'm probably gonna add some cool bone icon to load in new sessions at some point stay tuned.
