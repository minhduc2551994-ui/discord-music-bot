const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Set FFmpeg path from ffmpeg-static
process.env.FFMPEG_PATH = require('ffmpeg-static');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

// Initialize discord-player with high quality audio
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        dlChunkSize: 0, // disable chunking for better quality
    },
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
    // Load YoutubeExtractor with Android client (more reliable streaming)
    const { YoutubeExtractor } = require('discord-player-youtubei');
    await player.extractors.register(YoutubeExtractor, {
        streamOptions: {
            useClient: 'ANDROID_MUSIC',
        },
    });

    // Load default extractors for Spotify, SoundCloud, etc.
    const { DefaultExtractors } = require('@discord-player/extractor');
    await player.extractors.loadMulti(DefaultExtractors);

    // Load player events
    const playerEvents = require('./events/playerEvents');
    playerEvents.registerEvents(player);

    console.log('🎵 Discord Player initialized with extractors');

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
