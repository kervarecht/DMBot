const { SlashCommandBuilder } = require('discord.js');
const MacroService = require('../services/MacroService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('macro')
        .setDescription('Create and save dice roll macros for later use.')
        .addSubcommand(subcommand =>
            subcommand.setName('create')
                .setDescription('Create a new macro')
                .addStringOption(option =>
                    option.setName('create_macro_name')
                        .setRequired(true)
                        .setDescription('Name of the macro'))
                .addStringOption(option =>
                    option.setName('create_macro_dice')
                        .setRequired(true)
                        .setDescription('Dice to roll'))
                .addIntegerOption(option =>
                    option.setName('create_advantage')
                        .setRequired(false)
                        .setDescription('Roll with advantage? 1 = Advantage, 2 = Disadvantage'))
                .addStringOption(option =>
                    option.setName('create_macro_modifier')
                        .setRequired(false)
                        .setDescription('Modifier to apply to the roll')))
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('List all saved macros')
                .addIntegerOption(option =>
                    option.setName('all')
                        .setRequired(false)
                        .setDescription('List all server macros? 1 = Yes, 0 or Empty = Just your macros')))
        .addSubcommand(subcommand =>
            subcommand.setName('delete')
                .setDescription('Delete a macro')
                .addStringOption(option =>
                    option.setName('delete_macro_name')
                        .setRequired(true)
                        .setDescription('Name of the macro to delete')))
        .addSubcommand(subcommand =>
            subcommand.setName('use')
                .setDescription('Use a macro')
                .addStringOption(option =>
                    option.setName('macro_name')
                        .setRequired(true)
                        .setDescription('Name of the macro to use')))
        .addSubcommand(subcommand =>
            subcommand.setName('edit')
                .setDescription('Edit a macro')
                .addStringOption(option =>
                    option.setName('edit_macro_name')
                        .setRequired(true)
                        .setDescription('Name of the macro to edit'))
                .addStringOption(option =>
                    option.setName('edit_macro_dice')
                        .setRequired(true)
                        .setDescription('Dice to roll'))
                .addIntegerOption(option =>
                    option.setName('edit_advantage')
                        .setRequired(false)
                        .setDescription('Roll with advantage? 1 = Advantage, 2 = Disadvantage'))
                .addStringOption(option =>
                    option.setName('edit_macro_modifier')
                        .setRequired(false)
                        .setDescription('Modifier to apply to the roll')))
        .addSubcommand(subcommand =>
            subcommand.setName('clone')
                .setDescription('Clone a macro from another user')
                .addStringOption(option =>
                    option.setName('clone_macro_name')
                        .setRequired(true)
                        .setDescription('Name of the macro to clone'))
                .addUserOption(option =>
                    option.setName('user_name')
                        .setRequired(true)
                        .setDescription('User to clone the macro from'))),
    async execute(interaction) {
        const guildId = interaction.guildId;
        const userId = interaction.user.id;
        let macroName, macroDice, modifier, advantage;
        if (interaction.options.getSubcommand() === 'create') {
            macroName = interaction.options.getString('create_macro_name');
            macroDice = interaction.options.getString('create_macro_dice');
            modifier = interaction.options.getString('create_macro_modifier') || "0";
            advantage = interaction.options.getInteger('create_advantage') || 0;
            const result = await MacroService.createMacro(userId, macroName, macroDice, modifier, advantage, guildId);
            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'list') {
            console.log(guildId);
            const all = interaction.options.getInteger('all') || 0;
            const result = await MacroService.listMacros(guildId, interaction.user.id, all);
            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'delete') {
            macroName = interaction.options.getString('delete_macro_name');
            const result = await MacroService.deleteMacro(macroName, guildId, interaction.user.id);
            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'use') {
            const macroName = interaction.options.getString('macro_name');
            const result = await MacroService.useMacro(guildId, userId, macroName);
            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'edit') {
            macroName = interaction.options.getString('edit_macro_name');
            macroDice = interaction.options.getString('edit_macro_dice');
            modifier = interaction.options.getString('edit_macro_modifier') || 0;
            advantage = interaction.options.getInteger('edit_advantage') || 0;
            const result = await MacroService.editMacro(macroName, macroDice, macroModifier, advantage, guildId, interaction.user.id);
            await interaction.reply(result);
        }
        else if (interaction.options.getSubcommand() === 'clone') {
            macroName = interaction.options.getString('clone_macro_name');
            const userToCloneFrom = interaction.options.getUser('user_name');
            const userIdToCloneTo = interaction.user.id
            const result = await MacroService.cloneMacro(macroName, guildId, userIdToCloneTo, userToCloneFrom.id);
            await interaction.reply(result);
        }
    }

}