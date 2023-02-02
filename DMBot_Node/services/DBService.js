const sqlite3 = require('sqlite3').verbose();
const open = require('sqlite').open;
require('dotenv').config()
const database = process.env.DATABASE_PATH

//Trying postgres
const { Client } = require('pg');
const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT
});

client.connect((err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log("connected to postgressql db!");
    }
})


const query = async function (query, params) {
    let response;
    try {
        response = await client.query(query, params);
        console.log("response: ", response)
    } catch (err) {
        response = false
    }
    return response.rows[0]
    
}

const queryAll = async function (query, params) {
    let response;
    try {
        let result = await client.query(query, params);
        response = result.rows;
        console.log(response)
    }
    catch (err) {
        console.error(err);
        response = false;
    }
    return response;
}

const operation = async function (operation, params) {
    let response;
    try {
        response = await client.query(operation, params);
    }
    catch (err) {
        console.error(err);
        response = false;
    }
    return response;
    

    
}

module.exports = {
    query: query,
    operation: operation,
    queryAll: queryAll
}