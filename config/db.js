// const Pool = require('pg').Pool;
const { Pool } = require('pg');
// const pool = new Pool({
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT
// })
const pool = new Pool({
    user: 'postgres',
    password: 'Aa@Bb2023',
    database: 'edudev',
    host: 'localhost',
    port: 5432
})
// console.log(`./process.env.DB_PASSWORD`);

module.exports = pool;