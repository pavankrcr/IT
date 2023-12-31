const fs = require('fs/promises');
const userModel = require('../models/userModel');
const { emailConfig } = require('../config/config');
const AWS = require('aws-sdk');
require('dotenv').config();


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
      return res.status(400).send('ID, Name, and Email are required');
    }

        // Save PDF file to buffer
   const pdfBuffer = req.file ? await fs.readFile(req.file.path) : null;

   await userModel.initializeDatabase();

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
    },pdfBuffer);

    
    console.log('User data and PDF saved successfully:');

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
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
                <tr style="background-color: #4caf50; color: #fff; text-align: left;">
                  <th style="padding: 10px; border: 1px solid #ddd;">Field</th>
                  <th style="padding: 10px; border: 1px solid #ddd;">Value</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>ID</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>House Rent Paid (Yearly)</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${houseRent}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>PAN Number of Owner</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${panNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Home Loan Interest</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${homeLoanInterest}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Home Loan Principal</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${homeLoanPrincipal}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Deduction under 80C</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${deduction80C}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>National Pension scheme under section 80CCCD</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${nps}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Medical Insurance premium -Self</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${medicalInsuranceSelf}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Medical Insurance premium -Self dependent parents age less than 60</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${medicalInsuranceParentsLess60}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Medical Insurance premium -Self dependent parents age greater than 60</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${medicalInsuranceParentsGreater60}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Deduction under 80DDB (Medical expenses) Patient age less than 60</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${deduction80DDBLess60}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Deduction under 80DDB (Medical expenses) Patient age more than 60</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${deduction80DDBMore60}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Deduction under 80U (Differently abled person dependent)- Partial upto 40%</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${deduction80UPartial}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Deduction under 80U (Differently abled person dependent)- more than 40%</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${deduction80UMore40}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Deduction of Interest paid on Education loan</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${deductionInterestEducationLoan}</td>
                </tr>
              </table>
              <p style="text-align: center; margin-top: 20px; font-size: 16px; color: #555;">Attached is the PDF file containing additional details.</p>
            </div>`,
            },
          },
        
        },
        
      };

      ses.sendEmail(mailOptions, (sesErr, sesData) => {
        if (sesErr) {
          console.error('Error sending email with SES:', sesErr);
          return res.status(500).send('Internal Server Error');
        }

        console.log('Email sent with SES:', sesData);
        res.send('Form submitted successfully!');
      });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
   }
};

module.exports = {
  submitForm,
};
