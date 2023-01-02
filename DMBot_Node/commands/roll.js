const { SlashCommandBuilder } = require('discord.js');
const DiceService = require('../services/DiceService');
const FormatterService = require('../services/FormatterService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls dice!')
        .addStringOption(option => 
            option.setName('dice')
                .setDescription('Dice value to roll'))
        .addStringOption(option =>
            option.setName('modifier')
                .setDescription('Modifier'))
        .addIntegerOption(option => 
            option.setName('advantage')
                .setDescription('Empty or 0 = None, 1 = Advantage, 2 = Disadvantage')),
    async execute(interaction) {
        //console.log(interaction.options);
        const diceValue = interaction.options.getString('dice') ?? 'd20';        
        const modifier = interaction.options.getString('modifier') ?? 0;
        const advantage = interaction.options.getInteger('advantage') ?? 0;
        const result = DiceService.roll(diceValue, modifier, advantage);
        const total = FormatterService.formatTotal(result.total);
        const rolls = FormatterService.formatD20Rolls(result.results, advantage);
        await interaction.reply(`Total! ${total} - Rolls: ${rolls}`)
        
    },
}