const DBService = require('./DBService');
const DiceService = require('./DiceService');
const FormatterService = require('./FormatterService');

const createMacro = async function(userId, macroName, macroDice, modifier, advantage, guildId) {
    const validationErrors = validateMacro(macroDice, advantage, modifier);
    if (validationErrors) {
        return validationErrors;
    }
    const query = 'INSERT INTO macros (user_id, macro_name, macro_dice, modifier, advantage, guild_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING macro_id, macro_name';
    const params = [userId, macroName, macroDice, modifier, advantage, guildId];
    result = await DBService.operation(query, params);
    console.log(result);
    if (!result) {
        return "Error creating macro!"
    }
    else if (result.rows[0]){
        return `Macro ${macroName} created!`;
    }
    else {
        return "Error creating macro!"
    
    }
}

const validateMacro = function(macroDice, advantage, modifier) {
    console.log(`Validating macro ${macroDice} ${advantage} ${modifier}`);
    if (DiceService.validateDiceRoll(macroDice) == false) {
        return "Invalid dice - use format XdY, ex 2d12"
    }
    else if (![0,1,2].includes(advantage)) {
        return "Invalid advantage - use blank/0 for no advantage, 1 for advantage, 2 for disadvantage"
    }
    else if (DiceService.validateModifier(modifier) == false) {
        return "Invalid modifier - use format +X or -X, ex +5 or -2"
    }
    else {
        return false;
    }
}

const listMacros = async function(guildId, userId, all) {
    let query;
    if (all) {
        query = 'SELECT * FROM macros WHERE guild_id = $1';
        const params = [guildId];
        result = await DBService.queryAll(query, params)
    }
    else {
        query = 'SELECT * FROM macros WHERE guild_id = $1 AND user_id = $2';
        const params = [guildId, userId];
        result = await DBService.queryAll(query, params)
    }
    console.log(`Result: ${JSON.stringify(result)}`);
    if (!result) {
        return "No macros found!"
    }
    else {
        let macroList = [];
        for (let i = 0; i < result.length; i++) {
            let formattedMacro = FormatterService.formatMacro(result[i].macro_name, result[i].macro_dice, result[i].advantage, result[i].modifier);
            macroList.push(formattedMacro);
        }
        return macroList.join("\n");
    }
}

const deleteMacro = async function(guildId, userId, macroName) {
    const query = 'DELETE FROM macros WHERE guild_id = $1 AND user_id = $2 AND macro_name = $3 RETURNING macro_id';
    const params = [guildId, userId, macroName];
    const result = await DBService.operation(query, params);
    if (!result) {
        return "Something went wrong!"
    }
    else if (result.rows[0]){
        return `Macro ${macroName} deleted!`;
    }
}

const useMacro = async function(guildId, userId, macroName) {
    const query = 'SELECT * FROM macros WHERE guild_id = $1 AND user_id = $2 AND macro_name = $3';
    //console.log(`Using macro ${macroName} for user ${userId} in guild ${guildId}`)
    const params = [guildId, userId, macroName];
    const macro = await DBService.query(query, params);
    if (macro === "Not found!") {
        return macro
    }
    
    let diceValue, modifier, advantage;
    diceValue = macro.macro_dice;
    modifier = macro.modifier;
    if (modifier > 0) modifier = "+"+modifier;
    advantage = macro.advantage;
    console.log(`Using macro ${macroName} with dice ${diceValue}, modifier ${modifier}, advantage ${advantage}`);
    const result = DiceService.roll(diceValue, modifier, advantage);
    const total = FormatterService.formatTotal(result.total);
    const rolls = FormatterService.formatD20Rolls(result.results, advantage);
    const formattedAdvantage = FormatterService.formatAdvantage(advantage);
    return `${macroName} Total! ${total} - Rolls: ${rolls} [${formattedAdvantage}]`
}

const editMacro = async function(guildId, userId, macroName, macroDice, modifier, advantage) {
    const query = 'UPDATE macros SET macro_dice = $1, advantage = $2, modifier = $3 WHERE guild_id = $4 AND user_id = $5 AND macro_name = $6';
    const params = [macroDice, advantage, modifier, guildId, userId, macroName];
    return await DBService.operation(query, params);
}

const cloneMacro = async function(macroName, guildId, userIdToCloneTo, userIdToCloneFrom) {
    console.log(macroName, guildId, userIdToCloneTo, userIdToCloneFrom);
    const query = 'SELECT * FROM macros WHERE guild_id = $1 AND user_id = $2 AND macro_name = $3';
    const params = [guildId, userIdToCloneFrom, macroName];
    const macro = await DBService.query(query, params);
    if (!macro == "Not Found") {
        return "Macro not found!"
    }
    let cloneMacroName, cloneMacroDice, cloneModifier, cloneAdvantage;
    cloneMacroName = macro.macro_name;
    cloneMacroDice = macro.macro_dice;
    cloneModifier = macro.modifier;
    if (cloneModifier > 0) cloneModifier = "+"+cloneModifier;
    cloneAdvantage = macro.advantage;
    return await createMacro(userIdToCloneTo, cloneMacroName, cloneMacroDice, cloneModifier, cloneAdvantage, guildId);
}

module.exports = {
    createMacro: createMacro,
    listMacros: listMacros,
    deleteMacro: deleteMacro,
    useMacro: useMacro,
    editMacro: editMacro,
    cloneMacro: cloneMacro
}