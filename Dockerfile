FROM node:22-slim

# Install Pi and immediately purge the npm cache.
# Single-stage avoids the multi-stage partial-copy problem:
# Pi installs multiple JS files alongside its entry point in /usr/local/bin/
# and a selective COPY would leave sibling modules missing at runtime.
RUN npm install -g @earendil-works/pi-coding-agent \
        --no-fund \
        --no-audit \
    && npm cache clean --force

# Tools Pi will reach for during shell operations
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        curl \
        sqlite3 \
        ripgrep \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create expected dirs — volumes will overlay these at runtime
RUN mkdir -p \
        /root/.pi/agent \
        /root/.pi/extensions \
        /root/.pi/skills \
        /app/memory/sqlite \
        /app/suggestions \
        /app/workspace \
        /app/obsidian \
        /app/pi-credentials

WORKDIR /app

# Container stays alive; interact via:
#   docker exec -it pi-agent pi            (interactive TUI)
#   docker exec pi-agent pi -p "task"      (non-interactive / scripted)
CMD ["sleep", "infinity"]
