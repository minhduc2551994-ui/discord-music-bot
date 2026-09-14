FROM node:20-slim

# Install FFmpeg, yt-dlp binary, and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    build-essential \
    curl \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

# Set YTDLP_NO_UPDATE to skip download in postinstall (binary already installed above)
ENV YTDLP_NO_UPDATE=1
RUN npm install --production 2>&1; exit 0

COPY . .

CMD ["node", "src/index.js"]
