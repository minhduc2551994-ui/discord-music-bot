const { createNowPlayingEmbed } = require('../utils/embedBuilder');

function registerEvents(player) {
    // When a track starts playing
    player.events.on('playerStart', (queue, track) => {
        const embed = createNowPlayingEmbed(track, queue);
        queue.metadata.channel.send({ embeds: [embed] });
    });

    // When a track finishes
    player.events.on('playerFinish', (queue, track) => {
        // Optional: uncomment to notify when track finishes
        // queue.metadata.channel.send(`✅ Đã phát xong: **${track.cleanTitle}**`);
    });

    // When queue is empty and bot disconnects
    player.events.on('emptyQueue', (queue) => {
        queue.metadata.channel.send('📭 Hết bài trong queue! Bot sẽ rời voice channel.');
    });

    // When voice channel is empty
    player.events.on('emptyChannel', (queue) => {
        queue.metadata.channel.send('👋 Voice channel trống, bot tự rời.');
    });

    // Error handling
    player.events.on('playerError', (queue, error, track) => {
        console.error(`Player error [${track.title}]:`, error);
        queue.metadata.channel.send(`❌ Lỗi khi phát **${track.cleanTitle}**: ${error.message}`);
    });

    player.events.on('error', (queue, error) => {
        console.error('General player error:', error);
        queue.metadata.channel.send(`❌ Lỗi hệ thống: ${error.message}`);
    });

    // Debug (uncomment for troubleshooting)
    // player.events.on('debug', (queue, message) => console.log(`[DEBUG] ${message}`));

    console.log('🎧 Player events đã được đăng ký');
}

module.exports = { registerEvents };
