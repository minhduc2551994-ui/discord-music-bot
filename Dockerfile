FROM node:20

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg python3-pip unzip curl \
    && pip3 install --break-system-packages yt-dlp \
    && curl -fsSL https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip -o /tmp/deno.zip \
    && unzip /tmp/deno.zip -d /usr/local/bin/ \
    && chmod +x /usr/local/bin/deno \
    && rm /tmp/deno.zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . .
CMD ["node", "src/index.js"]
