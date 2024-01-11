//Trying postgres
const { Client } = require('pg');

let client;

if (process.env.PRODUCTION==1) {
    client = new Client({
        user: process.env.PGUSER_PROD,
        host: process.env.PGHOST_PROD,
        password: process.env.PGPASSWORD_PROD,
        database: process.env.PGDATABASE_PROD,
        port: process.env.PGPORT_PROD
    });
}
else {
    client = new Client({
        user: process.env.PGUSER_DEV,
        host: process.env.PGHOST_DEV,
        password: process.env.PGPASSWORD_DEV,
        database: process.env.PGDATABASE_DEV,
        port: process.env.PGPORT_DEV
    });

}

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
        console.log(response);
    } catch (err) {
        response = false
    }
    if (response.rows.length > 0){
        return response.rows[0]
    }
    else {
        return "Not found!"
    } 
}

const queryAll = async function (query, params) {
    let response;
    try {
        let result = await client.query(query, params);
        response = result.rows;
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