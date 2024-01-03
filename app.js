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

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});

// Create HTTPS server
const serverOptions = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath),
};

const httpsServer = https.createServer(serverOptions, app);


// Start the server
httpsServer.listen(port, () => {
  console.log(`Server is running at https://localhost:${port}`);
});

