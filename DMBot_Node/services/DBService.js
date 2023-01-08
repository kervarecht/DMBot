const sqlite3 = require('sqlite3').verbose();
const open = require('sqlite').open;
require('dotenv').config()
const database = process.env.DATABASE_PATH

const query = async function (query) {
    let response;
    /** 
    let db = new sqlite3.Database(database, (err) => {
        if (err) console.error(err);
        console.log("connected to DMBot DB");
    });
    **/
    let db = await open({
        filename: database,
        driver: sqlite3.Database
    })
    response = await db.get(query, []);
    return response
    db.close();
    
}

const operation = async function (operation) {
    let db = await open({
        filename: database,
        driver: sqlite3.Database
    })
    let result = await db.run(operation, []);
    return result;
    db.close();
    
}

module.exports = {
    query: query,
    operation: operation
}