FROM node:20

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg curl \
    && rm -rf /var/lib/apt/lists/*

# Download yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package.json ./

# Install deps (ignore postinstall errors from @distube/yt-dlp)
RUN npm install --production 2>&1; \
    # Copy system yt-dlp to where @distube/yt-dlp expects it
    mkdir -p node_modules/@distube/yt-dlp/bin && \
    cp /usr/local/bin/yt-dlp node_modules/@distube/yt-dlp/bin/yt-dlp && \
    chmod +x node_modules/@distube/yt-dlp/bin/yt-dlp

COPY . .
CMD ["node", "src/index.js"]
