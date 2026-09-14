FROM node:20-slim

# Install FFmpeg and yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# Skip postinstall scripts (yt-dlp is installed system-wide above)
RUN npm ci --production --ignore-scripts

COPY . .

CMD ["node", "src/index.js"]
