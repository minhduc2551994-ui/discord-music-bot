const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useQueue } = require('discord-player');
const { createQueueEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('📋 Xem danh sách bài chờ')
        .addIntegerOption((option) =>
            option.setName('page').setDescription('Số trang').setMinValue(1)
        ),

    async execute(interaction) {
        const queue = useQueue(interaction.guildId);

        if (!queue || !queue.currentTrack) {
            return interaction.reply({
                embeds: [createErrorEmbed('Queue trống! Dùng `/play` để thêm nhạc.')],
                ephemeral: true,
            });
        }

        const page = (interaction.options.getInteger('page') || 1) - 1;
        const { embed, totalPages } = createQueueEmbed(queue, page);

        // Create pagination buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`queue_prev_${page}`)
                .setLabel('◀️ Trước')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page <= 0),
            new ButtonBuilder()
                .setCustomId(`queue_next_${page}`)
                .setLabel('Sau ▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page >= totalPages - 1)
        );

        const response = await interaction.reply({
            embeds: [embed],
            components: totalPages > 1 ? [row] : [],
            fetchReply: true,
        });

        // Handle button interactions
        if (totalPages > 1) {
            const collector = response.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id,
                time: 60_000,
            });

            collector.on('collect', async (i) => {
                let newPage = page;
                if (i.customId.startsWith('queue_prev')) newPage = Math.max(0, page - 1);
                if (i.customId.startsWith('queue_next')) newPage = Math.min(totalPages - 1, page + 1);

                const { embed: newEmbed, totalPages: newTotal } = createQueueEmbed(queue, newPage);
                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`queue_prev_${newPage}`)
                        .setLabel('◀️ Trước')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(newPage <= 0),
                    new ButtonBuilder()
                        .setCustomId(`queue_next_${newPage}`)
                        .setLabel('Sau ▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(newPage >= newTotal - 1)
                );

                await i.update({ embeds: [newEmbed], components: [newRow] });
            });

            collector.on('end', () => {
                response.edit({ components: [] }).catch(() => {});
            });
        }
    },
};
