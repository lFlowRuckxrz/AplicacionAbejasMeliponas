const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('Connecting to MySQL to run migrations...');
  
  try {
    // Connect without database first to create it if it doesn't exist
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'melihub_user',
      password: process.env.DB_PASSWORD || 'cambiame_por_seguridad',
      multipleStatements: true // Allow executing multiple statements from the file
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(schemaSql);
    
    console.log('✅ Database and tables created successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure your MySQL server is running (e.g. XAMPP/MAMP).');
    }
  }
}

runMigration();
