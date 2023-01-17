const { SlashCommandBuilder, Events, ModalBuilder } = require('discord.js');
const CharacterService = require('../services/CharacterService.js');
const UserService = require('../services/UserService.js');
const FormatterService = require('../services/FormatterService.js');

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
                        .addChoices({ "name": "Dwarf", "value": "Dwarf" },
                            { "name": "Elf", "value": "Elf" },
                            { "name": "Halfling", "value": "Halfling" },
                            { "name": "Human", "value": "Human" },
                            { "name": "Dragonborn", "value": "Dragonborn" },
                            { "name": "Gnome", "value": "Gnome" },
                            { "name": "Half-Elf", "value": "Half-Elf" },
                            { "name": "Half-Orc", "value": "Half-Orc" },
                            { "name": "Tiefling", "value": "Tiefling" })
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

    ).addSubcommand(subcommand =>
        subcommand.setName('activate')
            .setDescription('Set a character to be your active character')
    ).addSubcommand(subcommand =>
        subcommand.setName('list')
            .setDescription('List my created characters by name.')
    )
        .addSubcommand(subcommand =>
            subcommand.setName('display')
                .setDescription('Display info on your active character.')
            )
    ,
    async execute(interaction) {
        
        let subcommand = await interaction.options.getSubcommand();
        if (subcommand == 'create') {
            let characterName, alignment, level, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores, active;
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
            active = interaction.options.getBoolean('active');
            let createResult = await CharacterService.createCharacter(characterName, alignment, level, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores);
            console.log(createResult);
            if (!createResult) {
                interaction.reply(`Failed to create new character!`);
            }
            else {
                let linkCharacter = await (CharacterService.linkCharacter(interaction.user.id, createResult, active))
                if (!linkCharacter) {
                    interaction.reply(`Created character but failed to link, please try again shortly.`);
                }
                else {
                    let activeString;
                    active ? activeString = 'active' : activeString = 'inactive'
                    interaction.reply(`Created ${characterName} and linked to ${interaction.user.username} as ${activeString} character!`);
                }
            }
        }
        else if (subcommand == 'list') {
            let result = await CharacterService.getCharactersByUser(interaction.user.id);
            if (!result) {
                interaction.reply(`No characters found for ${interaction.user.username}`);
            }
            else {
                let response = await FormatterService.formatCharacterList(result, ["character_name", "alignment"]);
                interaction.reply(`Characters! ${response}`);
            }
        }
        else if (subcommand == 'display') {
            let result = await CharacterService.getActiveCharacterInfo(interaction.user.id);
            if (!result) {
                interaction.reply(`No active character found for ${interaction.user.username}!`);
            }
            else {
                let response = await FormatterService.formatCharacterInfo(result, ["character_name", "alignment", "race", "speed", "size"]);
                if (!response) {
                    interaction.reply("Couldn't format character information.");
                }
                else {
                    interaction.reply(`${response}`);
                }
            }
        }
    }
};