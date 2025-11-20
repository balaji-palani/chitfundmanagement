require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres' // Connect to default DB first
});

async function createDatabase() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL default database.');

        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'Chit_management'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE "Chit_management"');
            console.log('Database "Chit_management" created successfully.');
        } else {
            console.log('Database "Chit_management" already exists.');
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
