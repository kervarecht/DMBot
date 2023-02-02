const DBService = require('../services/DBService.js');

const checkUser = async function (userId, guildId) {
    let parameters = [userId, guildId]
    let response = await DBService.query(`SELECT * FROM User WHERE discord_user_id = $1 AND guild_id = $2;`, parameters);
    
    if (!response) {
        return false
    }
    else {
        return response;
    }
}

const registerUser = async function (userId, guildId, userName) {
    let parameters = [userId, guildId, userName];
    let response = await DBService.operation(`INSERT INTO User (discord_user_id, guild_id, display_name) VALUES ($1, $2, $3)`, parameters);
    return response;
}

module.exports = {
    checkUser: checkUser,
    registerUser: registerUser
}