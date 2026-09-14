const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('⏭️ Bỏ qua bài hiện tại'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [createErrorEmbed('Không có bài nào đang phát!')],
                ephemeral: true,
            });
        }

        const currentTrack = queue.currentTrack;
        queue.node.skip();

        return interaction.reply({
            embeds: [createSuccessEmbed(`Đã bỏ qua: **${currentTrack?.cleanTitle || 'N/A'}**`)],
        });
    },
};
