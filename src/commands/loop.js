const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('🔁 Bật/tắt chế độ lặp')
        .addStringOption((option) =>
            option.setName('mode').setDescription('Chế độ lặp')
                .setRequired(true)
                .addChoices(
                    { name: '❌ Tắt', value: '0' },
                    { name: '🔂 Lặp bài hiện tại', value: '1' },
                    { name: '🔁 Lặp toàn bộ queue', value: '2' },
                )
        ),
    async execute(interaction) {
        const queue = interaction.client.distube.getQueue(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào đang phát!', flags: 64 });
        const mode = parseInt(interaction.options.getString('mode'));
        queue.setRepeatMode(mode);
        const modeNames = ['❌ Tắt lặp', '🔂 Lặp bài hiện tại', '🔁 Lặp toàn bộ queue'];
        await interaction.reply(modeNames[mode]);
    },
};
