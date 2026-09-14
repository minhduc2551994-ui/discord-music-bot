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

// Initialize discord-player with voice connection options
const player = new Player(client, {
    ytdlOptions: {
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
    },
    connectionTimeout: 30000, // 30 seconds timeout for voice connection
});

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
    // Load YoutubeExtractor from discord-player-youtubei (stable YouTube API)
    const { YoutubeExtractor } = require('discord-player-youtubei');
    await player.extractors.register(YoutubeExtractor, {});

    // Load remaining default extractors (Spotify, SoundCloud, etc.)
    const { DefaultExtractors } = require('@discord-player/extractor');
    await player.extractors.loadMulti(DefaultExtractors.filter(e => e.identifier !== 'com.discord-player.youtubeextractor'));

    // Load player events
    const playerEvents = require('./events/playerEvents');
    playerEvents.registerEvents(player);

    console.log('🎵 Discord Player initialized with extractors');

    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
}

main().catch(console.error);
