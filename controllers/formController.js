const fs = require('fs/promises');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');
const { emailConfig } = require('../config/config');

const submitForm = async (req, res) => {
  try {
    // Validate user input
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
      return res.status(400).send('ID, Name, and Email are required');
    }

    // Save form details to MySQL database
    userModel.saveUser(id, name, email, (error, results) => {
      if (error) {
        console.error('Error inserting user data into MySQL:', error);
        throw new Error('Failed to insert user data');
      }
      console.log('User data inserted into MySQL:', results);
    });

    // Save PDF file to disk
    let pdfPath;
    if (req.file ) {
      pdfPath = `uploads/${req.body.id}`;
      await fs.rename(req.file.path, pdfPath);
      console.log(pdfPath);
    }

    // Send confirmation email
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
    <h2 style="color: #333; text-align: center;">Thank you for submitting the form, ${name}!</h2>
    <!-- ... rest of the HTML ... -->
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
