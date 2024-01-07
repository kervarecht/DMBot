const { SlashCommandBuilder } = require('discord.js');
const UserService = require('../services/UserService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild
        let response = await UserService.checkUser(interaction.user.id, interaction.guildId)

        if (!response) {
            await UserService.registerUser(interaction.user.id, interaction.guildId, interaction.user.userName, function () {
                console.info(`Registered user ${interaction.user.username}!`)
            });
        }
        else {
            console.info(`Found user: ${JSON.stringify(response)}`)
        }


        await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}. Response: ${JSON.stringify(response)}`);
    }
};