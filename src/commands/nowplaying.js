const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('nowplaying').setDescription('🎵 Bài đang phát'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue?.songs.length) return interaction.reply({ content: '❌ Không có bài nào!', flags: 64 });
        const s = queue.songs[0];
        const fmt = (sec) => { const m = Math.floor(sec/60); return `${m}:${Math.floor(sec%60).toString().padStart(2,'0')}`; };
        await interaction.reply({ embeds: [{ color: 0x00ff00, title: '🎵 Đang phát', description: `**[${s.title}](${s.url})**`, fields: [{ name: '👤', value: s.uploader, inline: true }, { name: '⏱️', value: fmt(s.duration), inline: true }], thumbnail: { url: s.thumbnail } }] });
    },
};
