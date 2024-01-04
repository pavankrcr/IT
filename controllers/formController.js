const fs = require('fs/promises');
const userModel = require('../models/userModel');
const { emailConfig } = require('../config/config');
const AWS = require('aws-sdk');
const winston = require('winston');
const recaptcha = require('express-recaptcha');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Configure reCAPTCHA
// recaptcha.init(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

const submitForm = async (req, res) => {
  try {
    const {
      id,
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
    } = req.body;

    if (!id || !name || !email) {
      logger.error('ID, Name, and Email are required');
      return res.status(400).send('ID, Name, and Email are required');
    }

    // Save PDF file to buffer
    const pdfBuffer = req.file ? await fs.readFile(req.file.path) : null;

    await userModel.initializeDatabase();

    // // Verify reCAPTCHA
    // await new Promise((resolve, reject) => {
    //   recaptcha.verify(req, (recaptchaErr) => {
    //     if (recaptchaErr) {
    //       logger.error('reCAPTCHA verification failed:', recaptchaErr);
    //       reject('reCAPTCHA verification failed');
    //     } else {
    //       resolve();
    //     }
    //   });
    // });

    const existingUser = await userModel.getUserById(id);

    if (existingUser) {
      // If user exists, update the existing record
      await userModel.updateUserById(id, {
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
      }, pdfBuffer);
      logger.info('User data and PDF updated successfully.');
    } else {
      // If user does not exist, insert a new record
      await userModel.saveUser({
        empid: id,
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
      }, pdfBuffer);
      logger.info('User data and PDF saved successfully.');
    }

    // Send confirmation email using Amazon SES
    const ses = new AWS.SES({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });

    const mailOptions = {
      Source: emailConfig.user,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Form Submission Confirmation',
        },
        Body: {
          Html: {
            Data: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333; text-align: center;">Thank you for submitting the form, ${name}!</h2>
              <!-- ... (email content) ... -->
            </div>`,
          },
        },
      },
    };

    const sesData = await ses.sendEmail(mailOptions).promise();
    logger.info('Email sent with SES:', sesData);

    res.send('Form submitted successfully!');
  } catch (error) {
    logger.error(error);
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  submitForm,
  limiter,
};
