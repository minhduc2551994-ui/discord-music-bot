const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Dừng phát và rời voice'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào!', flags: 64 });
        queue.songs = [];
        queue.player.stop();
        interaction.client.musicQueue.delete(interaction.guildId);
        await interaction.reply('⏹️ Đã dừng!');
    },
};
