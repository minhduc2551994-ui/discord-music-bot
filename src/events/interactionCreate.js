const { Events } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle autocomplete interactions (e.g., /play search suggestions)
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`Autocomplete error [${interaction.commandName}]:`, error);
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Không tìm thấy command: ${interaction.commandName}`);
            return;
        }

        try {
            // Provide context for discord-player hooks
            const player = useMainPlayer();
            await player.context.provide({ guild: interaction.guild }, () =>
                command.execute(interaction)
            );
        } catch (error) {
            console.error(`Lỗi khi thực thi command ${interaction.commandName}:`, error);

            const reply = {
                content: '❌ Có lỗi xảy ra khi thực thi lệnh này!',
                ephemeral: true,
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(reply);
            } else {
                await interaction.reply(reply);
            }
        }
    },
};
