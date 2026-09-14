const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('⏹️ Dừng phát nhạc và rời voice channel'),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue) {
            return interaction.reply({
                embeds: [createErrorEmbed('Không có bài nào đang phát!')],
                ephemeral: true,
            });
        }

        queue.delete();

        return interaction.reply({
            embeds: [createSuccessEmbed('Đã dừng phát nhạc và rời voice channel! 👋')],
        });
    },
};
