const { EmbedBuilder } = require('discord.js');
const { formatDuration, createProgressBar } = require('./formatters');

const COLORS = {
    PRIMARY: 0x5865F2,   // Discord Blurple
    SUCCESS: 0x57F287,   // Green
    WARNING: 0xFEE75C,   // Yellow
    ERROR: 0xED4245,     // Red
    MUSIC: 0xE91E63,     // Pink
};

/**
 * Tạo embed cho bài đang phát
 */
function createNowPlayingEmbed(track, queue) {
    const embed = new EmbedBuilder()
        .setColor(COLORS.MUSIC)
        .setTitle('🎵 Đang phát')
        .setDescription(`[**${track.cleanTitle}**](${track.url})`)
        .addFields(
            { name: '👤 Nghệ sĩ', value: track.author || 'Unknown', inline: true },
            { name: '⏱️ Thời lượng', value: track.duration || 'N/A', inline: true },
            { name: '🔊 Nguồn', value: track.source || 'Unknown', inline: true }
        )
        .setFooter({ text: `Yêu cầu bởi ${track.requestedBy?.username || 'Unknown'}` })
        .setTimestamp();

    if (track.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}

/**
 * Tạo embed cho bài được thêm vào queue
 */
function createTrackAddedEmbed(track, queue) {
    const position = queue.tracks.size;

    const embed = new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setTitle('✅ Đã thêm vào hàng chờ')
        .setDescription(`[**${track.cleanTitle}**](${track.url})`)
        .addFields(
            { name: '👤 Nghệ sĩ', value: track.author || 'Unknown', inline: true },
            { name: '⏱️ Thời lượng', value: track.duration || 'N/A', inline: true },
            { name: '📋 Vị trí', value: `#${position}`, inline: true }
        )
        .setFooter({ text: `Yêu cầu bởi ${track.requestedBy?.username || 'Unknown'}` })
        .setTimestamp();

    if (track.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}

/**
 * Tạo embed cho queue
 */
function createQueueEmbed(queue, page = 0) {
    const pageSize = 10;
    const tracks = queue.tracks.toArray();
    const currentTrack = queue.currentTrack;
    const totalPages = Math.ceil(tracks.length / pageSize) || 1;
    const start = page * pageSize;
    const end = start + pageSize;
    const pageTracks = tracks.slice(start, end);

    let description = '';

    // Current track
    if (currentTrack) {
        description += `**🎵 Đang phát:**\n`;
        description += `[${currentTrack.cleanTitle}](${currentTrack.url}) — \`${currentTrack.duration}\`\n\n`;
    }

    // Queue tracks
    if (pageTracks.length > 0) {
        description += `**📋 Hàng chờ (${tracks.length} bài):**\n`;
        pageTracks.forEach((track, i) => {
            description += `**${start + i + 1}.** [${track.cleanTitle}](${track.url}) — \`${track.duration}\`\n`;
        });
    } else if (!currentTrack) {
        description = '📭 Queue trống! Dùng `/play` để thêm nhạc.';
    }

    const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY)
        .setTitle('🎶 Hàng chờ phát nhạc')
        .setDescription(description)
        .setFooter({ text: `Trang ${page + 1}/${totalPages} • ${tracks.length} bài trong queue` })
        .setTimestamp();

    return { embed, totalPages };
}

/**
 * Tạo embed cho nowplaying với progress bar
 */
function createDetailedNowPlayingEmbed(queue) {
    const track = queue.currentTrack;
    if (!track) {
        return new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setDescription('❌ Không có bài nào đang phát!');
    }

    const progress = queue.node.createProgressBar({
        timecodes: true,
        length: 15,
        indicator: '🔘',
        line: '▬',
    });

    const loopModes = ['❌ Tắt', '🔂 Lặp bài', '🔁 Lặp queue', '♾️ Autoplay'];

    const embed = new EmbedBuilder()
        .setColor(COLORS.MUSIC)
        .setTitle('🎵 Đang phát')
        .setDescription(
            `[**${track.cleanTitle}**](${track.url})\n\n` +
            `${progress || 'N/A'}\n\n` +
            `👤 **Nghệ sĩ:** ${track.author}\n` +
            `🔊 **Nguồn:** ${track.source}\n` +
            `🔁 **Lặp:** ${loopModes[queue.repeatMode] || 'Tắt'}\n` +
            `🔉 **Âm lượng:** ${queue.node.volume}%`
        )
        .setFooter({ text: `Yêu cầu bởi ${track.requestedBy?.username || 'Unknown'}` })
        .setTimestamp();

    if (track.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}

/**
 * Tạo embed lỗi
 */
function createErrorEmbed(message) {
    return new EmbedBuilder()
        .setColor(COLORS.ERROR)
        .setDescription(`❌ ${message}`);
}

/**
 * Tạo embed thành công
 */
function createSuccessEmbed(message) {
    return new EmbedBuilder()
        .setColor(COLORS.SUCCESS)
        .setDescription(`✅ ${message}`);
}

module.exports = {
    COLORS,
    createNowPlayingEmbed,
    createTrackAddedEmbed,
    createQueueEmbed,
    createDetailedNowPlayingEmbed,
    createErrorEmbed,
    createSuccessEmbed,
};
