const Pool = require('pg-pool');
require('dotenv').config();

// connects pool to database
const pool = new Pool({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_USER_PASSWORD,
    port:process.env.DATABASE_PORT,
    database:process.env.DATABASE_NAME,
    ssl: {
        rejectUnauthorized: false // allows internal Render SSL
    }
})

// creates abstract query method that we use in other parts of program
const query = (text, params) => {
    return pool.query(text, params);
}

module.exports = { pool, query };