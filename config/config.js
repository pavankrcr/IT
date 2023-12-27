require('dotenv').config();

module.exports = {
  // mysqlConfig: {
  //   host: process.env.DB_HOST,
  //   user: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database: process.env.DB_DATABASE,
  // },
  postgresConfig: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
  },
  emailConfig: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  port: process.env.PORT || 3000,
};
