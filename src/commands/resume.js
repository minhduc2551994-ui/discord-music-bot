const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('resume').setDescription('▶️ Tiếp tục phát'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào!', flags: 64 });
        queue.player.unpause();
        await interaction.reply('▶️ Tiếp tục phát!');
    },
};
