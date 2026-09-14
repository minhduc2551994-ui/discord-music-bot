const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('shuffle').setDescription('🔀 Xáo trộn danh sách phát'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào trong queue!', flags: 64 });
        queue.shuffle();
        await interaction.reply('🔀 Đã xáo trộn danh sách!');
    },
};
