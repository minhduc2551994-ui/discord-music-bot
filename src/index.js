const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
require('dotenv').config();

// Set FFmpeg path from ffmpeg-static (for local dev, Docker has system ffmpeg)
try { process.env.FFMPEG_PATH = require('ffmpeg-static'); } catch {}

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

// Initialize discord-player
const player = new Player(client, {
    connectionTimeout: 30000,
    skipFFmpeg: false,
});

// Prevent unhandled errors from crashing the bot
client.on('error', (error) => console.error('Client error:', error));
process.on('unhandledRejection', (error) => console.error('Unhandled rejection:', error));

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Initialize player and login
async function main() {
    // Load YoutubeExtractor with yt-dlp stream bridge
    const { YoutubeExtractor } = require('discord-player-youtubei');
    await player.extractors.register(YoutubeExtractor, {
        streamOptions: {
            useClient: 'IOS',
        },
        overrideDownloadFunction: async (url) => {
            console.log(`[YT-DLP] Streaming: ${url}`);
            return new Promise((resolve, reject) => {
                const proc = spawn('yt-dlp', [
                    '-f', 'bestaudio[ext=webm]/bestaudio',
                    '-o', '-',
                    '--no-playlist',
                    '--no-warnings',
                    url,
                ], { stdio: ['ignore', 'pipe', 'pipe'] });

                proc.stderr.on('data', (d) => console.log(`[YT-DLP] ${d.toString().trim()}`));
                proc.on('error', (err) => {
                    console.error('[YT-DLP] spawn error:', err.message);
                    reject(err);
                });

                resolve(proc.stdout);
            });
        },
    });

    // Load default extractors for Spotify, SoundCloud, etc.
    const { DefaultExtractors } = require('@discord-player/extractor');
    await player.extractors.loadMulti(DefaultExtractors);

    // Load player events
    const playerEvents = require('./events/playerEvents');
    playerEvents.registerEvents(player);

    console.log('🎵 Discord Player initialized with extractors + yt-dlp');

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);

    // Health check HTTP server (required for Render free Web Service)
    const http = require('node:http');
    const PORT = process.env.PORT || 3000;
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('🎵 Bot is running!');
    }).listen(PORT, () => {
        console.log(`🌐 Health check server on port ${PORT}`);
    });
}

main().catch(console.error);
