const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('⏸️ Tạm dừng phát nhạc'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [createErrorEmbed('Không có bài nào đang phát!')],
                ephemeral: true,
            });
        }

        queue.node.pause();

        return interaction.reply({
            embeds: [createSuccessEmbed(`Đã tạm dừng: **${queue.currentTrack?.cleanTitle || 'N/A'}** ⏸️`)],
        });
    },
};
