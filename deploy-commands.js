const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Đang đăng ký ${commands.length} slash commands...`);

        // Register to specific guild (instant, good for development)
        if (process.env.GUILD_ID) {
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`✅ Đã đăng ký ${data.length} commands cho guild ${process.env.GUILD_ID}`);
        } else {
            // Register globally (takes up to 1 hour to propagate)
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log(`✅ Đã đăng ký ${data.length} global commands`);
        }
    } catch (error) {
        console.error('❌ Lỗi đăng ký commands:', error);
    }
})();
