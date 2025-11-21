require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedAdmin() {
    try {
        console.log('Seeding admin user...');

        const username = 'admin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'admin';

        // Check if admin exists
        const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (res.rows.length > 0) {
            console.log('Admin user already exists. Updating role if needed...');
            await pool.query('UPDATE users SET role = $1 WHERE username = $2', [role, username]);
        } else {
            console.log('Creating new admin user...');
            await pool.query(
                'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
                [username, hashedPassword, role]
            );
        }

        console.log(`Admin user '${username}' seeded successfully.`);

    } catch (err) {
        console.error('Error seeding admin:', err);
    } finally {
        await pool.end();
    }
}

seedAdmin();
