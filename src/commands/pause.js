const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Tạm dừng bài hát'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào đang phát!', flags: 64 });
        if (queue.paused) return interaction.reply({ content: '⏸️ Đã tạm dừng rồi!', flags: 64 });
        queue.pause();
        await interaction.reply('⏸️ Đã tạm dừng!');
    },
};
