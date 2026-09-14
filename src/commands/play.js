const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Phát nhạc từ YouTube, Spotify, SoundCloud')
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('Tên bài hát hoặc URL')
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.member?.voice?.channel;
        if (!channel) {
            return interaction.reply({
                content: '❌ Bạn cần vào voice channel trước!',
                flags: 64,
            });
        }

        const query = interaction.options.getString('query', true);
        await interaction.deferReply();

        try {
            const distube = interaction.client.distube;
            
            // Add timeout - don't hang forever
            const playPromise = distube.play(channel, query, {
                member: interaction.member,
                textChannel: interaction.channel,
                metadata: { interaction },
            });

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout: Không tìm được bài hát sau 15 giây')), 15000)
            );

            await Promise.race([playPromise, timeoutPromise]);
            await interaction.followUp(`🔎 Đang xử lý: **${query}**`);
        } catch (error) {
            console.error('Play error:', error);
            try {
                await interaction.followUp(`❌ Không thể phát: ${error.message}`);
            } catch {}
        }
    },
};
