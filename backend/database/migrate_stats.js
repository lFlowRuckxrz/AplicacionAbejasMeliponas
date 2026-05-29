const db = require('../config/db');

async function runMigration() {
  console.log('Running interactive stats migration...');
  
  try {
    // Check if columns exist first by doing a try/catch on a simple select
    try {
      await db.query('SELECT vistas FROM negocios LIMIT 1');
      console.log('Columns already exist.');
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Adding "vistas" and "contactos" columns to "negocios" table...');
        await db.query('ALTER TABLE negocios ADD COLUMN vistas INT DEFAULT 0;');
        await db.query('ALTER TABLE negocios ADD COLUMN contactos INT DEFAULT 0;');
        console.log('✅ Columns added successfully.');
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
