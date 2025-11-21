require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanup() {
    try {
        console.log('Cleaning up public schema...');

        // Drop tables in public schema if they exist
        await pool.query('DROP TABLE IF EXISTS public.cycle_payments CASCADE');
        await pool.query('DROP TABLE IF EXISTS public.chit_cycles CASCADE');
        await pool.query('DROP TABLE IF EXISTS public.chit_members CASCADE');
        await pool.query('DROP TABLE IF EXISTS public.chits CASCADE');
        await pool.query('DROP TABLE IF EXISTS public.members CASCADE');

        console.log('Dropped tables from public schema.');
    } catch (err) {
        console.error('Error cleaning up:', err);
    } finally {
        await pool.end();
    }
}

cleanup();
