const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { createDetailedNowPlayingEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('🎵 Xem bài đang phát với progress bar'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({
                embeds: [createErrorEmbed('Không có bài nào đang phát!')],
                ephemeral: true,
            });
        }

        const embed = createDetailedNowPlayingEmbed(queue);
        return interaction.reply({ embeds: [embed] });
    },
};
