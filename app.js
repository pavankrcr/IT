const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const fs = require('fs');

const app = express();
const port = 3000;

// SQLite database setup
const db = new sqlite3.Database('user_details.db');
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)');

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files (CSS)
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', upload.single('pdf'), (req, res) => {
    // Validate user input
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send('Name and Email are required');
    }

    let pdfPath;
    // Save form details to SQLite database
    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
        if (err) {
            return res.status(500).send('Error saving to database');
        }

        // Save PDF file to disk
        if (req.file) {
            pdfPath = path.join(__dirname, 'uploads', req.file.filename);
            fs.rename(req.file.path, pdfPath, (err) => {
                if (err) throw err;
                console.log(pdfPath);
            });
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
            html:
                `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; text-align: center;">Thank you for submitting the form, ${name}!</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #ddd;">
                  <tr style="background-color: #4caf50; color: #fff; text-align: left;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Field</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Value</th>
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
              </div>
            
            `,
            attachments: req.file
                ? [
                    {
                        filename: req.file.originalname,
                        path: pdfPath
                    }
                ]
                : []
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).send('Error sending email');
            }
            console.log('Email sent: ' + info.response);
            res.send('Form submitted successfully!');
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
