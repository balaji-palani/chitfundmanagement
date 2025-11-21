require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedMembers() {
    try {
        console.log('Starting member seeding...');

        // 1. Get the first active chit
        const chitRes = await pool.query("SELECT id, name FROM chits WHERE status = 'active' LIMIT 1");

        let chitId;
        if (chitRes.rows.length === 0) {
            console.log('No active chit found. Creating a default chit...');
            const newChit = await pool.query(`
                INSERT INTO chits (name, total_amount, duration_months, commission_percent) 
                VALUES ('Gold Scheme 5L', 500000, 20, 5.0) 
                RETURNING id
            `);
            chitId = newChit.rows[0].id;
        } else {
            chitId = chitRes.rows[0].id;
            console.log(`Using existing chit: ${chitRes.rows[0].name} (ID: ${chitId})`);
        }

        // 2. Create 20 members
        console.log('Creating 20 members...');
        const memberIds = [];

        for (let i = 1; i <= 20; i++) {
            const name = `Member ${i}`;
            const contact = `98765432${i.toString().padStart(2, '0')}`;

            // Check if member exists to avoid duplicates (optional, but good for re-running)
            // For simplicity, we'll just insert. If unique constraint on name/contact exists, it might fail.
            // Assuming no unique constraint on name for now based on db.js schema.

            const memberRes = await pool.query(
                "INSERT INTO members (name, contact, notes) VALUES ($1, $2, $3) RETURNING id",
                [name, contact, 'Auto-seeded member']
            );
            memberIds.push(memberRes.rows[0].id);
        }
        console.log(`Created ${memberIds.length} members.`);

        // 3. Add members to the chit
        console.log(`Adding members to Chit ID: ${chitId}...`);
        for (const memberId of memberIds) {
            // Check if already added
            const check = await pool.query(
                "SELECT 1 FROM chit_members WHERE chit_id = $1 AND member_id = $2",
                [chitId, memberId]
            );

            if (check.rowCount === 0) {
                await pool.query(
                    "INSERT INTO chit_members (chit_id, member_id) VALUES ($1, $2)",
                    [chitId, memberId]
                );
            }
        }

        console.log('Successfully added 20 members to the chit.');

    } catch (err) {
        console.error('Error seeding members:', err);
    } finally {
        await pool.end();
    }
}

seedMembers();
