const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Bot đã online: ${client.user.tag}`);
        console.log(`🏠 Đang hoạt động trên ${client.guilds.cache.size} server(s)`);

        // Set bot activity
        client.user.setActivity('/play để phát nhạc 🎵', {
            type: ActivityType.Listening,
        });
    },
};
