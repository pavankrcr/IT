const express = require('express');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/formRoutes.js');
const path = require('path');
const ejs = require('ejs');
const { port } = require('./config/config.js');

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', formRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
