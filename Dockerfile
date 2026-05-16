FROM oven/bun:1.1-alpine

WORKDIR /app

# Install app dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Install gbrain globally
RUN bun install -g gbrain

# Configure gbrain to store its database on the persistent volume
RUN mkdir -p /root/.gbrain && \
    echo '{"engine":"pglite","database_path":"/data/.gbrain/brain.pglite"}' \
    > /root/.gbrain/config.json

# Copy source
COPY . .

EXPOSE 3456

# Ensure data directories exist at container start, then run server
CMD sh -c 'mkdir -p /data/brain/experiences/media /data/.gbrain && exec bun run src/server.ts'
