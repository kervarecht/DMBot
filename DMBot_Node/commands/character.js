const { SlashCommandBuilder, Events, ModalBuilder } = require('discord.js');
const CharacterService = require('../services/CharacterService.js');
const UserService = require('../services/UserService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('character')
        .setDescription('Create a new D&D Character to use')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
                .setDescription('Create a new character!')
                .addStringOption(option =>
                    option.setName('name')
                        .setRequired(true)
                        .setDescription('Your character\'s name')
                ).addBooleanOption(option =>
                    option.setName('active')
                        .setDescription('Make this your active character')
                )
                .addIntegerOption(option =>
                    option.setName('str')
                        .setDescription('Your character\'s base strength')
                )
                .addIntegerOption(option =>
                    option.setName('dex')
                        .setDescription('Your character\'s base dexterity')
                )
                .addIntegerOption(option =>
                    option.setName('int')
                        .setDescription('Your character\'s base intelligence')
                )
                .addIntegerOption(option =>
                    option.setName('wis')
                        .setDescription('Your character\'s base wisdom')
                )
                .addIntegerOption(option =>
                    option.setName('cha')
                        .setDescription('Your character\'s base charisma')
                )
                .addIntegerOption(option =>
                    option.setName('con')
                        .setDescription('Your character\'s base constitution')
                )
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('Your character\'s total level')
                )
                .addStringOption(option =>
                    option.setName('race')
                        .setDescription('Your character\'s race')
                )
                .addStringOption(option =>
                    option.setName('subrace')
                        .setDescription('Your character\'s subrace (if any)')
                )
                .addStringOption(option =>
                    option.setName('alignment')
                        .setDescription('Your character\'s alignment')
                        .addChoices({ "name": "Lawful Good", "value": "Lawful Good" },
                            { "name": "Neutral Good", "value": "Neutral Good" },
                            { "name": "Chaotic Good", "value": "Chaotic Good" },
                            { "name": "Lawful Neutral", "value": "Lawful Neutral" },
                            { "name": "True Neutral", "value": "True Neutral" },
                            { "name": "Chaotic Neutral", "value": "Chaotic Neutral" },
                            { "name": "Lawful Evil", "value": "Lawful Evil" },
                            { "name": "Neutral Evil", "value": "Neutral Evil" },
                            { "name": "Chaotic Evil", "value": "Chaotic Evil" },
                            { "name": "Unaligned", "value": "Unaligned" })
                )

        )
    ,
    async execute(interaction) {
        let characterName, alignment, level, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores;
        console.log(interaction.options);
        //Lots of null checks
        characterName = interaction.options.get('name', true).value;
        alignment = interaction.options.getString('alignment');
        level = interaction.options.getInteger('level');
        totalHP = interaction.options.getInteger('totalHP');
        currentHP = totalHP;
        tempHP = 0;
        race = interaction.options.getString('race');
        subrace = interaction.options.getString('subrace');
        abilityScores = {
            'str': interaction.options.getInteger('str'),
            'dex': interaction.options.getInteger('dex'),
            'int': interaction.options.getInteger('dex'),
            'wis': interaction.options.getInteger('wis'),
            'cha': interaction.options.getInteger('cha'),
            'con': interaction.options.getInteger('con')
        }
        
        let createResult = await CharacterService.createCharacter(characterName, alignment, level, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores);
        if (!createResult) {
            interaction.reply(`Failed to create new character!`);
        }
        else {
            interaction.reply(`Created ${characterName}!`);
        }
    }
};