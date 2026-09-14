const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { createTrackAddedEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Phát nhạc từ YouTube, Spotify, SoundCloud')
        .addStringOption((option) =>
            option
                .setName('query')
                .setDescription('Tên bài hát hoặc URL')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const player = useMainPlayer();
        const query = interaction.options.getFocused();

        if (!query) return interaction.respond([]);

        try {
            const results = await player.search(query);
            const choices = results.tracks.slice(0, 10).map((track) => ({
                name: `${track.cleanTitle} — ${track.author}`.substring(0, 100),
                value: track.url,
            }));
            await interaction.respond(choices);
        } catch {
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const channel = interaction.member?.voice?.channel;
        if (!channel) {
            return interaction.reply({
                embeds: [createErrorEmbed('Bạn cần vào voice channel trước!')],
                ephemeral: true,
            });
        }

        const query = interaction.options.getString('query', true);
        await interaction.deferReply();

        try {
            const player = useMainPlayer();
            const result = await player.play(channel, query, {
                nodeOptions: {
                    metadata: {
                        channel: interaction.channel,
                        requestedBy: interaction.user,
                    },
                    selfDeaf: true,
                    volume: 80,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 30000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 30000,
                },
                requestedBy: interaction.user,
                connectionOptions: {
                    deaf: true,
                },
            });

            const track = result.track;
            const queue = result.queue;

            // If this is the first track (now playing), don't send "added to queue" 
            // because playerStart event will handle it
            if (queue.tracks.size === 0 && queue.currentTrack === track) {
                return interaction.followUp({
                    content: `🔎 Đã tìm thấy: **${track.cleanTitle}** — đang phát...`,
                });
            }

            const embed = createTrackAddedEmbed(track, queue);
            return interaction.followUp({ embeds: [embed] });
        } catch (error) {
            console.error('Play error:', error);
            return interaction.followUp({
                embeds: [createErrorEmbed(`Không thể phát: ${error.message}`)],
            });
        }
    },
};
