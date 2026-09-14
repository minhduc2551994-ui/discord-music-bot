const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('resume').setDescription('▶️ Tiếp tục phát nhạc'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào đang phát!', flags: 64 });
        if (!queue.paused) return interaction.reply({ content: '▶️ Đang phát rồi!', flags: 64 });
        queue.resume();
        await interaction.reply('▶️ Tiếp tục phát!');
    },
};
