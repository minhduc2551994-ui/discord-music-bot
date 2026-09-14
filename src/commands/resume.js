const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('▶️ Tiếp tục phát nhạc'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue) {
            return interaction.reply({
                embeds: [createErrorEmbed('Không có bài nào trong queue!')],
                ephemeral: true,
            });
        }

        queue.node.resume();

        return interaction.reply({
            embeds: [createSuccessEmbed(`Tiếp tục phát: **${queue.currentTrack?.cleanTitle || 'N/A'}** ▶️`)],
        });
    },
};
