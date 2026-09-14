const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { searchYouTube, getAudioStream, createFFmpegStream } = require('../music');

async function playSong(queue) {
    if (!queue.songs.length) {
        queue.textChannel?.send('📭 Hết bài! Bot rời voice.');
        queue.connection?.destroy();
        return;
    }

    const song = queue.songs[0];
    queue.playing = true;

    try {
        // Get audio URL from yt-dlp
        const audioUrl = await getAudioStream(song.url);

        // Create FFmpeg stream → opus
        const stream = createFFmpegStream(audioUrl);
        const resource = createAudioResource(stream, { inputType: StreamType.OggOpus });

        queue.player.play(resource);

        queue.textChannel?.send({
            embeds: [{
                color: 0x00ff00,
                title: '🎵 Đang phát',
                description: `**[${song.title}](${song.url})**`,
                fields: [
                    { name: '👤 Nghệ sĩ', value: song.uploader, inline: true },
                    { name: '⏱️ Thời lượng', value: formatDuration(song.duration), inline: true },
                ],
                thumbnail: { url: song.thumbnail },
            }],
        });
    } catch (error) {
        console.error('Play error:', error);
        queue.textChannel?.send(`❌ Lỗi phát **${song.title}**: ${error.message}`);
        queue.songs.shift();
        playSong(queue);
    }
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Phát nhạc từ YouTube')
        .addStringOption(o => o.setName('query').setDescription('Tên bài hát hoặc URL YouTube').setRequired(true)),

    async execute(interaction) {
        const channel = interaction.member?.voice?.channel;
        if (!channel) return interaction.reply({ content: '❌ Vào voice channel trước!', flags: 64 });

        const query = interaction.options.getString('query', true);
        await interaction.deferReply();

        try {
            // Search
            const results = await searchYouTube(query);
            if (!results.length) return interaction.followUp('❌ Không tìm thấy bài nào!');

            const song = results[0];
            song.user = interaction.user;

            let queue = interaction.client.musicQueue.get(interaction.guildId);

            if (!queue) {
                // Join voice + create queue
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer();
                connection.subscribe(player);

                queue = interaction.client.musicQueue.create(interaction.guildId, {
                    connection,
                    player,
                    textChannel: interaction.channel,
                });

                // When song ends
                player.on(AudioPlayerStatus.Idle, () => {
                    if (queue.loopMode === 1) {
                        // Loop current song
                        playSong(queue);
                    } else {
                        queue.songs.shift();
                        if (queue.loopMode === 2 && song) {
                            queue.songs.push(song); // Loop queue
                        }
                        if (queue.songs.length) {
                            playSong(queue);
                        } else {
                            queue.textChannel?.send('📭 Hết bài! Bot rời voice.');
                            interaction.client.musicQueue.delete(interaction.guildId);
                        }
                    }
                });

                player.on('error', (error) => {
                    console.error('Player error:', error);
                    queue.textChannel?.send(`❌ Lỗi player: ${error.message}`);
                    queue.songs.shift();
                    if (queue.songs.length) playSong(queue);
                });

                queue.songs.push(song);
                await interaction.followUp(`🔎 Đang tải: **${song.title}**`);
                playSong(queue);
            } else {
                // Add to queue
                queue.songs.push(song);
                await interaction.followUp(`✅ Đã thêm **${song.title}** — ${formatDuration(song.duration)} (vị trí #${queue.songs.length})`);
            }
        } catch (error) {
            console.error('Play error:', error);
            await interaction.followUp(`❌ Lỗi: ${error.message?.slice(0, 200)}`).catch(() => {});
        }
    },
};
