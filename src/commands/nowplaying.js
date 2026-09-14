const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('nowplaying').setDescription('🎵 Xem bài đang phát'),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào đang phát!', flags: 64 });
        const song = queue.songs[0];
        await interaction.reply({
            embeds: [{
                color: 0x00ff00,
                title: '🎵 Đang phát',
                description: `**[${song.name}](${song.url})**`,
                fields: [
                    { name: '👤 Nghệ sĩ', value: song.uploader?.name || 'Unknown', inline: true },
                    { name: '⏱️ Thời lượng', value: song.formattedDuration, inline: true },
                ],
                thumbnail: { url: song.thumbnail || '' },
            }],
        });
    },
};
