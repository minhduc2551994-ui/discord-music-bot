FROM node:20

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3-pip \
    && pip3 install --break-system-packages yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --production 2>&1; \
    mkdir -p node_modules/@distube/yt-dlp/bin && \
    ln -sf /usr/local/bin/yt-dlp node_modules/@distube/yt-dlp/bin/yt-dlp

COPY . .
CMD ["node", "src/index.js"]
