const { Pool } = require('pg');
const { postgresConfig } = require('../config/config');
const AWS = require('aws-sdk');
require('dotenv').config();

const pool = new Pool(postgresConfig);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    empid VARCHAR(6),
    name TEXT,
    email TEXT,
    houseRent DECIMAL,
    panNumber VARCHAR(12),
    homeLoanInterest DECIMAL,
    homeLoanPrincipal DECIMAL,
    deduction_LIC DECIMAL,
    deduction_MutualFund DECIMAL,
    deduction_NSC DECIMAL,
    deduction_PPF DECIMAL,
    deduction_Sukanya_Smaruddhi_Scheme DECIMAL,
    deduction_Fixed_Deposit DECIMAL,
    deduction_StampDuty DECIMAL,
    deduction_Others DECIMAL,
    nps DECIMAL,
    medicalInsuranceSelf DECIMAL,
    medicalInsuranceParentsLess60 DECIMAL,
    medicalInsuranceParentsGreater60 DECIMAL,
    deduction80DDBLess60 DECIMAL,
    deduction80DDBMore60 DECIMAL,
    deduction80UPartial DECIMAL,
    deduction80UMore40 DECIMAL,
    deductionInterestEducationLoan DECIMAL
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
const getUserById = async (userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  } finally {
    client.release();
  }
};

const updateUserById = async (userId, userData, pdfBuffer) => {
  const client = await pool.connect();
  try {
    const {
      empid,
      name,
      email,
      houseRent,
      panNumber,
      homeLoanInterest,
      homeLoanPrincipal,
      deduction_LIC,
      deduction_MutualFund,
      deduction_NSC,
      deduction_PPF,
      deduction_Sukanya_Smaruddhi_Scheme,
      deduction_Fixed_Deposit,
      deduction_StampDuty,
      deduction_Others,
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

    const updateQuery = `
      UPDATE users 
      SET 
        empid = $1,
        name = $2,
        email = $3,
        houseRent = $4,
        panNumber = $5,
        homeLoanInterest = $6,
        homeLoanPrincipal = $7,
        deduction_LIC = $8,
        deduction_MutualFund = $9,
        deduction_NSC = $10,
        deduction_PPF = $11,
        deduction_Sukanya_Smaruddhi_Scheme = $12,
        deduction_Fixed_Deposit = $13,
        deduction_StampDuty = $14,
        deduction_Others = $15,
        nps = $16,
        medicalInsuranceSelf = $17,
        medicalInsuranceParentsLess60 = $18,
        medicalInsuranceParentsGreater60 = $19,
        deduction80DDBLess60 = $20,
        deduction80DDBMore60 = $21,
        deduction80UPartial = $22,
        deduction80UMore40 = $23,
        deductionInterestEducationLoan = $24
      WHERE 
        id = $1
    `;

    const updateValues = [
      empid,
      name,
      email,
      houseRent,
      panNumber,
      homeLoanInterest,
      homeLoanPrincipal,
      deduction_LIC,
      deduction_MutualFund,
      deduction_NSC,
      deduction_PPF,
      deduction_Sukanya_Smaruddhi_Scheme,
      deduction_Fixed_Deposit,
      deduction_StampDuty,
      deduction_Others,
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

    await client.query(updateQuery, updateValues);    // Implement updating user in the database
  } finally {
    client.release();
  }

};

const saveUser = async (userData, pdfBuffer, callback) => {
  try {
    const {
      empid,
      name,
      email,
      houseRent,
      panNumber,
      homeLoanInterest,
      homeLoanPrincipal,
      deduction_LIC,
      deduction_MutualFund,
      deduction_NSC,
      deduction_PPF,
      deduction_Sukanya_Smaruddhi_Scheme,
      deduction_Fixed_Deposit,
      deduction_StampDuty,
      deduction_Others,
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
        (empid, name, email,houseRent, panNumber, homeLoanInterest, homeLoanPrincipal, deduction_LIC,deduction_MutualFund,deduction_NSC,deduction_PPF,deduction_Sukanya_Smaruddhi_Scheme,deduction_Fixed_Deposit, deduction_StampDuty,deduction_Others, nps, medicalInsuranceSelf, medicalInsuranceParentsLess60, medicalInsuranceParentsGreater60, deduction80DDBLess60, deduction80DDBMore60, deduction80UPartial, deduction80UMore40, deductionInterestEducationLoan) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,$24)
    `;

    const insertValues = [
      empid,
      name,
      email,
      houseRent,
      panNumber,
      homeLoanInterest,
      homeLoanPrincipal,
      deduction_LIC,
      deduction_MutualFund,
      deduction_NSC,
      deduction_PPF,
      deduction_Sukanya_Smaruddhi_Scheme,
      deduction_Fixed_Deposit,
      deduction_StampDuty,
      deduction_Others,
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

  // Save PDF to Amazon S3
  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${userData.empid}.pdf`,
    Body: pdfBuffer,
    ContentType: 'application/pdf',

  };



  s3.upload(s3Params, (s3Err, s3Data) => {
    if (s3Err) {
      console.error('Error uploading PDF to S3:', s3Err);
      if (callback)
        callback(s3Err);
    } else {
      console.log('PDF uploaded to S3:');
      if (callback)
        callback(null, result);
    }
  });
};

module.exports = {
  initializeDatabase,
  getUserById,
  updateUserById,
  saveUser,
};
