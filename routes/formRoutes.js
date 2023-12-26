const express = require('express');
const multer = require('multer');
const formController = require('../controllers/formController');

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/submit', upload.single('pdf'), formController.submitForm);

module.exports = router;
