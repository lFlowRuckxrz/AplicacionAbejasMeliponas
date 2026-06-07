require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'melihub_user',
  password: process.env.DB_PASSWORD || 'cambiame_por_seguridad',
  database: process.env.DB_NAME || 'abejas_meliponas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises for async/await support
const promisePool = pool.promise();

module.exports = promisePool;
