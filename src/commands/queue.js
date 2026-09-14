const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('queue').setDescription('📋 Xem danh sách bài hát'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào trong queue!', flags: 64 });

        const current = queue.songs[0];
        const upcoming = queue.songs.slice(1, 11);

        let description = `🎵 **Đang phát:** [${current.name}](${current.url}) — ${current.formattedDuration}\n\n`;
        
        if (upcoming.length > 0) {
            description += '**📋 Tiếp theo:**\n';
            upcoming.forEach((song, i) => {
                description += `\`${i + 1}.\` [${song.name}](${song.url}) — ${song.formattedDuration}\n`;
            });
        }

        if (queue.songs.length > 11) {
            description += `\n... và ${queue.songs.length - 11} bài nữa`;
        }

        await interaction.reply({
            embeds: [{
                color: 0x0099ff,
                title: `📋 Hàng chờ — ${queue.songs.length} bài`,
                description,
            }],
        });
    },
};
