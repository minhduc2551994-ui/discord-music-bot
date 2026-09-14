const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Dừng phát nhạc và xóa queue'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào đang phát!', flags: 64 });
        queue.stop();
        await interaction.reply('⏹️ Đã dừng phát nhạc!');
    },
};
