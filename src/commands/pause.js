const { SlashCommandBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
module.exports = {
    data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Tạm dừng'),
    async execute(interaction) {
        const queue = interaction.client.musicQueue.get(interaction.guildId);
        if (!queue) return interaction.reply({ content: '❌ Không có bài nào!', flags: 64 });
        if (queue.player.state.status === AudioPlayerStatus.Paused) return interaction.reply({ content: '⏸️ Đã pause rồi!', flags: 64 });
        queue.player.pause();
        await interaction.reply('⏸️ Đã tạm dừng!');
    },
};
