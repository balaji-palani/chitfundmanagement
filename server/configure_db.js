require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function configure() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Try to set search_path for the user and database
        try {
            await client.query('ALTER ROLE CURRENT_USER SET search_path TO chit, public');
            console.log('Set search_path for current user.');
        } catch (e) {
            console.warn('Could not set search_path for user:', e.message);
        }

        try {
            await client.query('ALTER DATABASE "Chit_management" SET search_path TO chit, public');
            console.log('Set search_path for database.');
        } catch (e) {
            console.warn('Could not set search_path for database:', e.message);
        }

    } catch (err) {
        console.error('Error configuring database:', err);
    } finally {
        await client.end();
    }
}

configure();
