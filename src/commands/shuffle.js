const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('shuffle').setDescription('🔀 Xáo trộn queue'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue || queue.songs.length < 3) return interaction.reply({ content: '❌ Cần ít nhất 3 bài!', flags: 64 });
        const current = queue.songs.shift();
        for (let i = queue.songs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]]; }
        queue.songs.unshift(current);
        await interaction.reply('🔀 Đã xáo trộn!');
    },
};
