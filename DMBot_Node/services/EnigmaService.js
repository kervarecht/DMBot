const DBService = require('./DBService');

const checkAccessToCypher = async function (guildId, cypherId) {
    let query = `SELECT * FROM cypher_guild_map WHERE guild_id = $1 and cypher_id = $2`
    let result = await DBService.operation(query, [guildId, cypherId])
    if (!result) {
        return false
    }
    else {
        if (result.rows[0].guild_id === guildId) {
            return true;
        }
        else {
            return false;
        }
    }

}

const listAvailableCyphers = async function (guildId) {
    let query = `SELECT c.name FROM cyphers c INNER JOIN cypher_guild_map cgm ON c.id = cgm.cypher_id WHERE cgm.guild_id = $1`;
    let result = await DBService.operation(query, [guildId]);
    if (!result) {
        return new Error("Failed to get cyphers!");
    }
    else {
        return JSON.stringify(result.rows);
    }
}

const getCypherId = async function (algorithm) {
    algorithm = algorithm.toLowerCase().trim();
    let query = `SELECT id FROM cyphers WHERE name = $1`
    let result = await DBService.operation(query, [algorithm])
    if (!result) {
        return new Error("Failed to get cypher!");
    }
    else if (result.rows.length == 0) {
        return 0;
            } else 
            {        return result.rows[0].id;
    }
}

const cypherDiscovered = async function (guildId, cypherId) {   
    let query = `SELECT * FROM cypher_guild_map WHERE guild_id = $1 and cypher_id = $2`
    let result = await DBService.operation(query, [guildId, cypherId]);
    if (!result) {
        return false;
    }
    else {
        if (result.rows.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
}

const discoverCypher = async function (guildId, cypherName) {
    let cypherId = await getCypherId(cypherName);
    if (!cypherId) {
        return "I don't know that cypher!";
    }
    if (await cypherDiscovered(guildId, cypherId)) {
        return "You already know that cypher!";
    }
    else {
    let query = `INSERT INTO cypher_guild_map (guild_id, cypher_id) VALUES ($1, $2)`
    let result = await DBService.operation(query, [guildId, cypherId])
    if (!result) {
        return new Error("Failed to discover cypher!");
    }
    else {
        return "Discovered cypher!";
    }
}
}

const encrypt = async function (message, algorithm, key, guildId) {
    if (!key) key = "";
    console.log(message, algorithm, key, guildId)
    const cypherId = await getCypherId(algorithm);
    const hasAccess = await checkAccessToCypher(guildId, cypherId);
    if (!hasAccess) {
        return "You do not have access to this cypher!";
    }
    switch (algorithm) {
        case "caesar":
            if (isNaN(key)){
                return "Key must be a number!"
            }
            key = Number(key);
            return caesarEncrypt(message, key);
        case "vigenere":
            if (!isNaN(key)){
                return "Key cannot be a number!"
            }
            return vigenereEncrypt(message, key);
        case "atbash":
            return atbashEncrypt(message, key);
        case "affine":
            return affineEncrypt(message, key);
        case "railfence":
            return railfenceEncrypt(message, key);
        case "rot13":
            return rot13Encrypt(message, key);
        default:
            return "Invalid algorithm!";
    }
}

const decrypt = async function (message, algorithm, key, guildId) {
    if (!key) key = "";
    const cypherId = await getCypherId(algorithm);
    const hasAccess = await checkAccessToCypher(guildId, cypherId);
    if (!hasAccess) {
        return "You do not have access to this cypher!";
    }
    switch (algorithm) {
        case "caesar":
            if (isNaN(key)){
                return "Key must be a number!"
            }
            key = Number(key);
            return caesarDecrypt(message, key);
        case "vigenere":
            if (!isNaN(key)){
                return "Key cannot be a number!"
            }
            return vigenereDecrypt(message, key);
        case "atbash":
            return atbashDecrypt(message, key);
        case "affine":
            return affineDecrypt(message, key);
        case "railfence":
            return railfenceDecrypt(message, key);
        case "rot13":
            return rot13Decrypt(message, key);
        default:
            return "Invalid algorithm!";
    }
}

const caesarEncrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + key) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + key) % 26) + 97);
            }
        }
        result += char;
    }
    return result;
}

const caesarDecrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 - key + 26) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 - key + 26) % 26) + 97);
            }
        }
        result += char;
    }
    return result;
}

const vigenereEncrypt = function (message, key) {
    let result = "";
    for (let i = 0, j = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            let shift = key[j % key.length].toUpperCase().charCodeAt(0) - 65; // Convert key character to shift amount
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
            }
            j++;
        }
        result += char;
    }
    return result;
}

const vigenereDecrypt = function (message, key) {
    let result = "";
    for (let i = 0, j = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            let shift = key[j % key.length].toUpperCase().charCodeAt(0) - 65; // Convert key character to shift amount
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
            }
            j++;
        }
        result += char;
    }
    return result;
}

const atbashEncrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode((90 - (code - 65)));
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode((122 - (code - 97)));
            }
        }
        result += char;
    }
    return result;
}

const atbashDecrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode((90 - (code - 65)));
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode((122 - (code - 97)));
            }
        }
        result += char;
    }
    return result;
}

const affineEncrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65) * key[0] + key[1]) % 26 + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97) * key[0] + key[1]) % 26 + 97);
            }
        }
        result += char;
    }
    return result;
}

const affineDecrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 - key[1]) * key[0]) % 26 + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 - key[1]) * key[0]) % 26 + 97);
            }
        }
        result += char;
    }
    return result;
}

const railfenceEncrypt = function (message, key) {
    let result = "";
    let rail = [];
    for (let i = 0; i < key; i++) {
        rail.push([]);
    }
    let dir = false;
    let row = 0;
    for (let i = 0; i < message.length; i++) {
        rail[row].push(message[i]);
        if (row === 0 || row === key - 1) {
            dir = !dir;
        }
        if (dir) {
            row++;
        }
        else {
            row--;
        }
    }
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < rail[i].length; j++) {
            result += rail[i][j];
        }
    }
    return result;
}

const railfenceDecrypt = function (message, key) {
    let result = "";
    let rail = [];
    for (let i = 0; i < key; i++) {
        rail.push([]);
    }
    let dir = false;
    let row = 0;
    for (let i = 0; i < message.length; i++) {
        rail[row].push(message[i]);
        if (row === 0 || row === key - 1) {
            dir = !dir;
        }
        if (dir) {
            row++;
        }
        else {
            row--;
        }
    }
    for (let i = 0; i < key; i++) {
        for (let j = 0; j < rail[i].length; j++) {
            result += rail[i][j];
        }
    }
    return result;
}

const rot13Encrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + 13) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
        }
        result += char;
    }
    return result;
}

const rot13Decrypt = function (message, key) {
    let result = "";
    for (let i = 0; i < message.length; i++) {
        let char = message[i];
        if (char.match(/[a-z]/i)) {
            let code = message.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 - 13) % 26) + 65);
            }
            else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 - 13) % 26) + 97);
            }
        }
        result += char;
    }
    return result;
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    listAvailableCyphers: listAvailableCyphers,
    discoverCypher: discoverCypher
}