const DBService = require('../services/DBService.js');

const createCharacter = async function (characterName, alignment, totalLevel, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores) {
    characterName = "'" + characterName + "'"
    alignment ? alignment = "'" + alignment + "'" : 'NULL'
    if (!totalLevel) totalLevel = 'NULL'
    if (!xp) xp = 'NULL'
    if (!totalHP) totalHP = 'NULL'
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
    return (result.lastID);
}

const linkCharacter = async function (userId, characterId, active) {
    if (active) {
        let update = `UPDATE user_character_map SET active = 0 WHERE user_id = ${userId}`
        let insert = `INSERT INTO user_character_map (user_id, character_id, active) VALUES (${userId}, ${characterId}, 1)`
        let updateResult = await DBService.operation(update, [])
        if (!updateResult) {
            return new Error("failed to update characters");
        }
        else {
            let insertResult = await DBService.operation(insert, [])
            if (!insertResult) {
                return new Error("failed to insert new linked character!");
            } else {
                return insertResult.lastID;
            }
        }
    }
    else {
        let insert = `INSERT INTO user_character_map (user_id, character_id, active) VALUES (${userId}, ${characterId}, 0)`
        let insertResult = await DBService.operation(insert, []);
        if (!insertResult) {
            return new Error("Failed to insert new linked character!");
        }
        else {
            return insertResult.lastID;
        }
    }

}

const getCharactersByUser = async function (userId) {
    let query = 'SELECT c.* FROM character c INNER JOIN user_character_map ucm ON ucm.character_id = c.id;'
    let response = await DBService.queryAll(query, []);
    return response
}

const getActiveCharacterInfo = async function (userId) {
    let activeCharacterIdQuery = `SELECT ucm.character_id FROM user_character_map ucm WHERE ucm.user_id = ${userId} and ucm.active=1;`
    let activeCharacterId = await DBService.query(activeCharacterIdQuery, []);
    if (!activeCharacterId) {
        return false
    }
    let characterId = activeCharacterId.character_id;    
    let activeCharacterInfoQuery = `SELECT c.*, r.name as 'race', r.speed as 'speed', s.name as 'size', rt.name as 'trait_name', \
                                        rt.ability_score as 'trait_ability_score', rt.modifier as 'trait_modifier', \
                                        rt.description as 'trait_description' \
                                        FROM character c \
                                        LEFT JOIN races r  ON c.race = r.id \
                                        LEFT JOIN sizes s ON r.size = s.id \
                                        LEFT JOIN races_traits rt  ON rt.race_id = r.id \
                                        WHERE c.id = ${characterId};`
    let activeCharacterInfo = await DBService.queryAll(activeCharacterInfoQuery, []);
    return activeCharacterInfo;
}

module.exports = {
    createCharacter: createCharacter,
    linkCharacter: linkCharacter,
    getCharactersByUser: getCharactersByUser,
    getActiveCharacterInfo: getActiveCharacterInfo
}