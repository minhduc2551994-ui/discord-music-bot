const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('🔀 Xáo trộn thứ tự queue'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue || queue.tracks.size < 2) {
            return interaction.reply({
                embeds: [createErrorEmbed('Cần ít nhất 2 bài trong queue để xáo trộn!')],
                ephemeral: true,
            });
        }

        queue.tracks.shuffle();

        return interaction.reply({
            embeds: [createSuccessEmbed(`Đã xáo trộn ${queue.tracks.size} bài trong queue! 🔀`)],
        });
    },
};
