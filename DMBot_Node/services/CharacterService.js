const DBService = require('../services/DBService.js');

const createCharacter = async function (characterName, alignment, totalLevel, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores) {
    if (!alignment) alignment = null
    if (!totalLevel) totalLevel = null
    if (!xp) xp = null
    if (!totalHP) totalHP = null
    currentHP = totalHP
    if (!tempHP) tempHP = 0;
    if (!race) race = null
    if (!subrace) subrace = null
    for (score in abilityScores) {
        if (!abilityScores[score]) abilityScores[score] = null;
    }
    let parameters = [characterName, alignment, totalLevel, xp, totalHP, currentHP, tempHP, race, subrace, abilityScores.str, abilityScores.dev, abilityScores.it, abilityScores.wis, abilityScores.cha, abilityScores.con]
    let query = `INSERT INTO character (character_name, alignment, total_level, xp, total_hp, current_hp, temp_hp, race, subrace, \
        base_str, base_dex, base_int, base_wis, base_cha, base_con) \
        VALUES ($1, $2, $3, $4, \
        $5, $6, $7, $8, $9, \
        $10, $11, $12, \
        $13, $14, $15) RETURNING id`
    let result = await DBService.operation(query, parameters);
    if (result) {
        return result.rows[0].id
    }
    else {
        return false;
    }
}

const linkCharacter = async function (userId, characterId, active) {
    if (active) {
        let update = `UPDATE user_character_map SET active = 0 WHERE user_id = $1`
        let insert = `INSERT INTO user_character_map (user_id, character_id, active) VALUES ($1, $2, 1) RETURNING id`
        let updateResult = await DBService.operation(update, [userId])
        if (!updateResult) {
            return new Error("failed to update characters");
        }
        else {
            let insertResult = await DBService.operation(insert, [userId, characterId])
            if (!insertResult) {
                return new Error("failed to insert new linked character!");
            } else {
                return insertResult.lastID;
            }
        }
    }
    else {
        let insert = `INSERT INTO user_character_map (user_id, character_id, active) VALUES ($1, $2, 0) RETURN id`
        let insertResult = await DBService.operation(insert, [userId, characterId]);
        if (!insertResult) {
            return new Error("Failed to insert new linked character!");
        }
        else {
            return insertResult.lastID;
        }
    }
}

const getCharactersByUser = async function (userId) {
    let query = 'SELECT c.* FROM character c INNER JOIN user_character_map ucm ON ucm.character_id = c.id WHERE c.id = $1;'
    let response = await DBService.queryAll(query, [userId]);
    return response
}

const getActiveCharacterInfo = async function (userId) {
    let activeCharacterIdQuery = `SELECT ucm.character_id FROM user_character_map ucm WHERE ucm.user_id = $1 and ucm.active=1;`
    let activeCharacterId = await DBService.query(activeCharacterIdQuery, [userId]);
    if (!activeCharacterId) {
        return false
    }
    let characterId = activeCharacterId.character_id;
    console.log(characterId);
    let activeCharacterInfoQuery = `SELECT c.*, r.name as "race", r.speed as "speed", s.name as "size", rt.name as "trait_name", \
                                        rt.ability_score as "trait_ability_score", rt.modifier as "trait_modifier", \
                                        rt.description as "trait_description" \
                                        FROM character c \
                                        LEFT JOIN races r  ON c.race = r.id \
                                        LEFT JOIN sizes s ON r.size = s.id \
                                        LEFT JOIN races_traits rt  ON rt.race_id = r.id \
                                        WHERE c.id = $1;`
    let activeCharacterInfo = await DBService.queryAll(activeCharacterInfoQuery, [characterId]);
    return activeCharacterInfo;
}

module.exports = {
    createCharacter: createCharacter,
    linkCharacter: linkCharacter,
    getCharactersByUser: getCharactersByUser,
    getActiveCharacterInfo: getActiveCharacterInfo
}