const DBService = require('../services/DBService.js');

const createCharacter = async function (characterName, alignment, totalLevel, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores) {
    characterName = "'" + characterName + "'"
    alignment ? alignment = "'" + alignment + "'" : 'NULL'
    if (!totalLevel) totalLevel = 'NULL'
    if (!xp) xp = 'NULL'
    if (!totalHP) totalHP ='NULL'
    currentHP = totalHP
    if (!tempHP) tempHP = 0;
    race ? race = "'" + race + "'" : race = 'NULL'
    subrace ? subrace = "'" + subrace + "'" : subrace = 'NULL'
    for (score in abilityScores) {
        if (!abilityScores[score]) abilityScores[score] = 'NULL';
    }
    let query = `INSERT INTO character (character_name, alignment, total_level, xp, total_hp, current_hp, temp_hp, race, subrace, \
        base_str, base_dex, base_int, base_wis, base_cha, base_con) \
        VALUES (${characterName}, ${alignment}, ${totalLevel}, ${xp}, \
        ${totalHP}, ${currentHP}, ${tempHP}, ${race}, ${subrace}, \
        ${abilityScores.str}, ${abilityScores.dex}, ${abilityScores.int}, \
        ${abilityScores.wis}, ${abilityScores.cha}, ${abilityScores.con})`
    let result = await DBService.operation(query);
    return(result);
}

const linkCharacter = async function(userId, characterId, active){

}

const getCharactersByUser = async function(userId){

}

module.exports = {
    createCharacter: createCharacter,
    linkCharacter: linkCharacter,
    getCharactersByUser: getCharactersByUser
}