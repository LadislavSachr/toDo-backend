const Pool = require('pg-pool');
require('dotenv').config();

// connects pool to database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // allows internal Render SSL
    }
})

// creates abstract query method that we use in other parts of program
const query = (text, params) => {
    return pool.query(text, params);
}

module.exports = { pool, query };