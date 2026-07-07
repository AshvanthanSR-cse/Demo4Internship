require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    ssl: false

});

pool.connect()

.then(() => {

    console.log("===================================");

    console.log("PostgreSQL Connected Successfully");

    console.log("===================================");

})

.catch((error) => {

    console.log("Database Connection Failed");

    console.log(error);

});

module.exports = pool;