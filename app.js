const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const sqlite3 = require('better-sqlite3');

const app = express();
const port = 3000;

// SQLite database setup
const dbfile = new sqlite3('your_database.db');
dbfile.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, empid INTEGER, name TEXT, email TEXT)');

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    cb(null, req.body.id + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Routes
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/submit', upload.single('pdf'), async (req, res) => {
  const connection = new sqlite3('your_database.db');

  try {
    // Validate user input
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
      return res.status(400).send('ID, Name, and Email are required');
    }

    // Save form details to SQLite database
    const insertStmt = connection.prepare('INSERT INTO users (empid, name, email) VALUES (?, ?, ?)');
    const insertResult = insertStmt.run(id, name, email);

    if (insertResult.changes !== 1) {
      throw new Error('Failed to insert user data');
    }

    // Save PDF file to disk
    let pdfPath;
    if (req.file) {
      pdfPath = path.join(__dirname, 'uploads', req.file.filename);
      await fs.rename(req.file.path, pdfPath);
      console.log(pdfPath);
    }

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pavankrcr21@gmail.com', // Enter your Gmail address
        pass: 'lhljektzbpgwnkus' // Enter your Gmail password
      }
    });

    const mailOptions = {
      from: 'pavankrcr21@gmail.com', // Enter your Gmail address
      to: email,
      subject: 'Form Submission Confirmation',
      text: `Thank you for submitting the form, ${name}!`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
      </table>
      <p style="text-align: center; margin-top: 20px; font-size: 16px; color: #555;">Attached is the PDF file containing additional details.</p>
    </div>`,
      attachments: req.file
        ? [
          {
            filename: req.file.originalname,
            path: pdfPath
          }
        ]
        : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.send('Form submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the database connection
    connection.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
