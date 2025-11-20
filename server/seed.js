const db = require('./db');

const members = [];
for (let i = 1; i <= 60; i++) {
    members.push({
        name: `Member ${i}`,
        contact: `98765${String(i).padStart(5, '0')}`,
        notes: `Auto-generated member ${i}`
    });
}

const chits = [
    { name: '1L Chit Group', total_amount: 100000, duration_months: 20, commission_percent: 5.0 },
    { name: '2L Chit Group', total_amount: 200000, duration_months: 20, commission_percent: 5.0 },
    { name: '5L Chit Group', total_amount: 500000, duration_months: 20, commission_percent: 5.0 }
];

const seed = async () => {
    try {
        console.log('Seeding initiated...');

        // Clear existing data
        await db.query('TRUNCATE TABLE members, chits, chit_members, chit_cycles, cycle_payments RESTART IDENTITY CASCADE');
        console.log('Cleared existing data.');

        // Insert Members
        for (const m of members) {
            await db.query('INSERT INTO members (name, contact, notes) VALUES ($1, $2, $3)', [m.name, m.contact, m.notes]);
        }
        console.log('Inserted 60 members.');

        // Insert Chits and Assign Members
        for (let i = 0; i < chits.length; i++) {
            const chit = chits[i];
            const res = await db.query(
                'INSERT INTO chits (name, total_amount, duration_months, start_date, commission_percent) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [chit.name, chit.total_amount, chit.duration_months, new Date().toISOString().split('T')[0], chit.commission_percent]
            );
            const chitId = res.rows[0].id;
            console.log(`Created Chit: ${chit.name} (ID: ${chitId})`);

            // Assign 20 members
            const startMemberId = (i * 20) + 1;
            const endMemberId = startMemberId + 19;

            for (let mid = startMemberId; mid <= endMemberId; mid++) {
                await db.query('INSERT INTO chit_members (chit_id, member_id) VALUES ($1, $2)', [chitId, mid]);
            }
            console.log(`Assigned members ${startMemberId}-${endMemberId} to Chit ${chitId}`);
        }

        console.log('Seeding completed.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        // process.exit(0); // Keep connection open if needed, or close
    }
};

// Wait for DB connection and initialization before seeding
db.initPromise.then(seed);
