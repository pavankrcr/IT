const { Pool } = require('pg');
const { postgresConfig } = require('../config/config');

const pool = new Pool(postgresConfig);

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    empid INTEGER,
    name TEXT,
    email TEXT,
    houseRent INTEGER,
    panNumber TEXT,
    homeLoanInterest INTEGER,
    homeLoanPrincipal INTEGER,
    deduction80C INTEGER,
    nps INTEGER,
    medicalInsuranceSelf INTEGER,
    medicalInsuranceParentsLess60 INTEGER,
    medicalInsuranceParentsGreater60 INTEGER,
    deduction80DDBLess60 INTEGER,
    deduction80DDBMore60 INTEGER,
    deduction80UPartial INTEGER,
    deduction80UMore40 INTEGER,
    deductionInterestEducationLoan INTEGER
  );
`;

const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    console.log('Table created or already exists');
    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const saveUser = async (userData) => {
  try {
    const {
      empid,
      name,
      email,
      houseRent,
      panNumber,
      homeLoanInterest,
      homeLoanPrincipal,
      deduction80C,
      nps,
      medicalInsuranceSelf,
      medicalInsuranceParentsLess60,
      medicalInsuranceParentsGreater60,
      deduction80DDBLess60,
      deduction80DDBMore60,
      deduction80UPartial,
      deduction80UMore40,
      deductionInterestEducationLoan,
    } = userData;

    const insertQuery = `
      INSERT INTO users 
        (empid, name, email, houseRent, panNumber, homeLoanInterest, homeLoanPrincipal, deduction80C, nps, medicalInsuranceSelf, medicalInsuranceParentsLess60, medicalInsuranceParentsGreater60, deduction80DDBLess60, deduction80DDBMore60, deduction80UPartial, deduction80UMore40, deductionInterestEducationLoan) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `;

    const insertValues = [
      empid,
      name,
      email,
      houseRent,
      panNumber,
      homeLoanInterest,
      homeLoanPrincipal,
      deduction80C,
      nps,
      medicalInsuranceSelf,
      medicalInsuranceParentsLess60,
      medicalInsuranceParentsGreater60,
      deduction80DDBLess60,
      deduction80DDBMore60,
      deduction80UPartial,
      deduction80UMore40,
      deductionInterestEducationLoan,
    ];

    const client = await pool.connect();
    await client.query(insertQuery, insertValues);
    console.log('User data inserted into PostgreSQL');
    client.release();
  } catch (error) {
    console.error('Error inserting user data into PostgreSQL:', error);
    throw new Error('Failed to insert user data');
  }
};

module.exports = {
  initializeDatabase,
  saveUser,
};
