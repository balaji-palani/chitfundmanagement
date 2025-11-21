require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addRoleColumn() {
    try {
        console.log('Adding role column to users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
        `);
        console.log('Role column added successfully.');
    } catch (err) {
        console.error('Error adding role column:', err);
    } finally {
        await pool.end();
    }
}

addRoleColumn();
