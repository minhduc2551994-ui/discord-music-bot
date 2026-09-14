const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { MusicQueue } = require('./music');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Music queue
client.musicQueue = new MusicQueue();

// Error handling
client.on('error', (e) => console.error('Client error:', e));
process.on('unhandledRejection', (e) => console.error('Unhandled:', e));

// Load commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) client.once(event.name, (...a) => event.execute(...a));
    else client.on(event.name, (...a) => event.execute(...a));
}

// Login
client.login(process.env.DISCORD_TOKEN).then(() => {
    // Check yt-dlp
    try {
        const ver = execSync('yt-dlp --version').toString().trim();
        console.log(`🎵 yt-dlp ${ver} ready`);
    } catch {
        console.error('❌ yt-dlp not found!');
    }

    // Health check
    const http = require('node:http');
    const PORT = process.env.PORT || 3000;
    http.createServer((_, res) => {
        res.writeHead(200);
        res.end('OK');
    }).listen(PORT, () => console.log(`🌐 Port ${PORT}`));
}).catch(console.error);
