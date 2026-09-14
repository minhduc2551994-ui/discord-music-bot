const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('loop').setDescription('🔁 Chế độ lặp')
        .addStringOption(o => o.setName('mode').setDescription('Chế độ').setRequired(true)
            .addChoices({ name: '❌ Tắt', value: '0' }, { name: '🔂 Lặp bài', value: '1' }, { name: '🔁 Lặp queue', value: '2' })),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào!', flags: 64 });
        queue.loopMode = parseInt(interaction.options.getString('mode'));
        const names = ['❌ Tắt lặp', '🔂 Lặp bài hiện tại', '🔁 Lặp toàn bộ queue'];
        await interaction.reply(names[queue.loopMode]);
    },
};
