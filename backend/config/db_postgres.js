const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool (use this on Render in production)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Connected successfully to PostgreSQL database pool.');
});

pool.on('error', (err) => {
  console.error('Unexpected database client error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
