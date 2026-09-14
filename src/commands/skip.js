const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('skip').setDescription('⏭️ Bỏ qua bài hiện tại'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào đang phát!', flags: 64 });
        queue.skip();
        await interaction.reply('⏭️ Đã bỏ qua!');
    },
};
