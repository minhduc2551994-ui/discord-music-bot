const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { DisTube } = require('distube');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Initialize DisTube (v4 has built-in YouTube support via ytdl-core)
const distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    nsfw: true,
});

// Prevent crashes
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

// DisTube events
distube
    .on('playSong', (queue, song) => {
        console.log(`🎵 Playing: ${song.name} [${song.formattedDuration}]`);
        queue.textChannel?.send({
            embeds: [{
                color: 0x00ff00,
                title: '🎵 Đang phát',
                description: `**[${song.name}](${song.url})**`,
                fields: [
                    { name: '👤 Nghệ sĩ', value: song.uploader?.name || 'Unknown', inline: true },
                    { name: '⏱️ Thời lượng', value: song.formattedDuration || '0:00', inline: true },
                    { name: '🔊 Nguồn', value: song.source || 'youtube', inline: true },
                ],
                thumbnail: { url: song.thumbnail || '' },
                footer: { text: `Yêu cầu bởi ${song.user?.username || 'Unknown'}` },
            }],
        });
    })
    .on('addSong', (queue, song) => {
        queue.textChannel?.send(`✅ Đã thêm **${song.name}** — ${song.formattedDuration} vào hàng chờ`);
    })
    .on('finish', (queue) => {
        queue.textChannel?.send('📭 Hết bài trong queue! Bot sẽ rời voice channel.');
    })
    .on('empty', (queue) => {
        queue.textChannel?.send('👋 Voice channel trống, bot tự rời.');
    })
    .on('error', (channel, error) => {
        console.error('DisTube error:', error);
        if (channel) channel.send(`❌ Lỗi: ${error.message}`);
    });

// Make distube accessible from commands
client.distube = distube;

// Login
client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('🎵 DisTube v4 initialized (built-in YouTube)');

    // Health check HTTP server for Render
    const http = require('node:http');
    const PORT = process.env.PORT || 3000;
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running!');
    }).listen(PORT, () => {
        console.log(`🌐 Health check server on port ${PORT}`);
    });
}).catch(console.error);
