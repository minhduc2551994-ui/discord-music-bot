const { SlashCommandBuilder } = require('discord.js');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('🔁 Thay đổi chế độ lặp')
        .addIntegerOption((option) =>
            option
                .setName('mode')
                .setDescription('Chế độ lặp')
                .setRequired(true)
                .addChoices(
                    { name: '❌ Tắt', value: QueueRepeatMode.OFF },
                    { name: '🔂 Lặp bài hiện tại', value: QueueRepeatMode.TRACK },
                    { name: '🔁 Lặp toàn bộ queue', value: QueueRepeatMode.QUEUE },
                    { name: '♾️ Autoplay (tự tìm bài tương tự)', value: QueueRepeatMode.AUTOPLAY }
                )
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.isPlaying()) {
            return interaction.reply({
                embeds: [createErrorEmbed('Không có bài nào đang phát!')],
                ephemeral: true,
            });
        }

        const mode = interaction.options.getInteger('mode', true);
        queue.setRepeatMode(mode);

        const modeNames = {
            [QueueRepeatMode.OFF]: '❌ Tắt lặp',
            [QueueRepeatMode.TRACK]: '🔂 Lặp bài hiện tại',
            [QueueRepeatMode.QUEUE]: '🔁 Lặp toàn bộ queue',
            [QueueRepeatMode.AUTOPLAY]: '♾️ Autoplay — tự tìm bài tương tự',
        };

        return interaction.reply({
            embeds: [createSuccessEmbed(`Chế độ lặp: **${modeNames[mode]}**`)],
        });
    },
};
