const DBService = require('../services/DBService.js');

const checkUser = async function (userId, guildId) {
    let response = await DBService.query(`SELECT * FROM User WHERE discord_user_id = ${userId} AND guild_id = ${guildId};`);
    if (!response) {
        return false
    }
    else {
        return response;
    }
}

const registerUser = async function (userId, guildId, userName) {
    let response = await DBService.operation(`INSERT INTO User (discord_user_id, guild_id, display_name) VALUES (${userId}, ${guildId}, '${userName}')`);
    return response;
}

module.exports = {
    checkUser: checkUser,
    registerUser: registerUser
}