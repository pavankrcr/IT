const { Pool } = require('pg');
const { postgresConfig } = require('../config/config');

const pool = new Pool(postgresConfig);

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL database');
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    empid INTEGER,
    name TEXT,
    email TEXT
  );
`

// Execute the table creation query
pool.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table created or already exists');
  }
});


const saveUser = (id, name, email, callback) => {
  const insertQuery = 'INSERT INTO users (empid, name, email) VALUES ($1, $2, $3)';
  const insertValues = [id, name, email];
  pool.query(insertQuery, insertValues, callback);
};

module.exports = {
  saveUser,
};
