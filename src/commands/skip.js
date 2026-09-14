const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('skip').setDescription('⏭️ Bỏ qua bài hiện tại'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue?.songs.length) return interaction.reply({ content: '❌ Không có bài nào!', flags: 64 });
        queue.player.stop(); // triggers Idle → plays next
        await interaction.reply('⏭️ Đã skip!');
    },
};
