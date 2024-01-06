const { SlashCommandBuilder } = require('discord.js');
const EnigmaService = require('../services/EnigmaService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enigma')
        .setDescription('Enigma will gladly decrypt your message for you!')
        .addSubcommand(subcommand =>
            subcommand.setName('decrypt')
                .setDescription('Decrypts a message')
                .addStringOption(option =>
                    option.setName('decrypt_message')
                        .setRequired(true)
                        .setDescription('Message to decrypt'))
                .addStringOption(option =>
                    option.setName('decrypt_algorithm')
                        .setRequired(true)
                        .setDescription('Algorithm to use'))
                .addIntegerOption(option =>
                    option.setName('decrypt_key')
                        .setRequired(false)
                        .setDescription('Key to use(if the algorithm requires it)')))
        .addSubcommand(subcommand =>
            subcommand.setName('encrypt')
                .setDescription('Encrypts a message')
                .addStringOption(option =>
                    option.setName('encrypt_message')
                        .setRequired(true)
                        .setDescription('Message to encrypt'))
                .addStringOption(option =>
                    option.setName('encrypt_algorithm')
                        .setRequired(true)
                        .setDescription('Algorithm to use'))
                .addIntegerOption(option =>
                    option.setName('encrypt_key')
                        .setRequired(false)
                        .setDescription('Key to use(if the algorithm requires it)')))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('Lists all available algorithms'))
        .addSubcommand(subcommand =>
            subcommand.setName('discover')
                .setDescription('Discover a new algorithm')
                .addStringOption(option =>
                    option.setName('algorithm_name')
                        .setRequired(true)
                        .setDescription('Algorithm to discover'))),
    async execute(interaction) {
        const guildId = interaction.guildId;
        if (interaction.options.getSubcommand() === 'decrypt') {
            const message = interaction.options.getString('decrypt_message');
            const algorithm = interaction.options.getString('decrypt_algorithm');
            const key = interaction.options.getInteger('decrypt_key') || false;
            const result = await EnigmaService.decrypt(message, algorithm, key, guildId);
            await interaction.reply(result);
        } else if (interaction.options.getSubcommand() === 'encrypt'){
            const message = interaction.options.getString('encrypt_message');
            const algorithm = interaction.options.getString('encrypt_algorithm');
            const key = interaction.options.getInteger('encrypt_key') || false;
            const result = await EnigmaService.encrypt(message, algorithm, key, guildId);
            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'list'){
            const result = await EnigmaService.listAvailableCyphers(guildId);
            if (result.length == 0) {
                await interaction.reply('Sorry, no algorithms available.');
            }
            else {
                console.log(typeof result);
                const algorithms = JSON.parse(result).map(algorithm => algorithm.name).join(', ');
                await interaction.reply(`I know these algorithms: ${algorithms}.`);
        }
        }
        else if (interaction.options.getSubcommand() === 'discover'){
            const algorithm = interaction.options.getString('algorithm_name');
            const result = await EnigmaService.discoverCypher(guildId, algorithm);
            console.log(result);
            await interaction.reply(result);
        }
    },
}