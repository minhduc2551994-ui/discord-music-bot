const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('queue').setDescription('📋 Xem danh sách'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue?.songs.length) return interaction.reply({ content: '❌ Queue trống!', flags: 64 });
        const fmt = (s) => { const m = Math.floor(s/60); return `${m}:${Math.floor(s%60).toString().padStart(2,'0')}`; };
        const current = queue.songs[0];
        let desc = `🎵 **Đang phát:** [${current.title}](${current.url}) — ${fmt(current.duration)}\n\n`;
        const upcoming = queue.songs.slice(1, 11);
        if (upcoming.length) {
            desc += '**📋 Tiếp theo:**\n';
            upcoming.forEach((s, i) => { desc += `\`${i+1}.\` [${s.title}](${s.url}) — ${fmt(s.duration)}\n`; });
        }
        if (queue.songs.length > 11) desc += `\n... và ${queue.songs.length - 11} bài nữa`;
        await interaction.reply({ embeds: [{ color: 0x0099ff, title: `📋 Queue — ${queue.songs.length} bài`, description: desc }] });
    },
};
