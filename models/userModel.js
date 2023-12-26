const mysql = require('mysql');
const { mysqlConfig } = require('../config/config');

const connection = mysql.createConnection(mysqlConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

const saveUser = (id, name, email, callback) => {
  const insertQuery = 'INSERT INTO users (empid, name, email) VALUES (?, ?, ?)';
  const insertValues = [id, name, email];
  connection.query(insertQuery, insertValues, callback);
};

module.exports = {
  saveUser,
};
