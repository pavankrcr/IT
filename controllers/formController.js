const fs = require('fs/promises');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');
const { emailConfig } = require('../config/config');

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
    });

    let pdfPath;
    if (req.file) {
      pdfPath = `uploads/${req.body.id}`;
      await fs.rename(req.file.path, pdfPath);
      console.log(pdfPath);
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: emailConfig,
    });

    const mailOptions = {
      from: emailConfig.user,
      to: email,
      subject: 'Form Submission Confirmation',
      text: `Thank you for submitting the form, ${name}!`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- ... (rest of the HTML) ... -->
      </div>`,
      attachments: req.file ? [{ filename: req.file.originalname, path: pdfPath }] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.send('Form submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  submitForm,
};
