const { Pool } = require('pg');

// Connect to database
const pool = new Pool({
    user: 'postgres',
    password: '123',
    host: 'localhost',
    database:'company'
});

pool.connect();
console.log("Connected to the company database!");

module.exports = pool;