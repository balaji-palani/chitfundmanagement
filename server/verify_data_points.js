require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const dataPoints = [
    { expectedPayment: 17000, discount: 175000 },
    { expectedPayment: 25000, discount: 15000 },
    { expectedPayment: 17000, discount: 175000 },
    { expectedPayment: 18650, discount: 142000 },
    { expectedPayment: 20800, discount: 99000 },
    { expectedPayment: 21550, discount: 84000 },
    { expectedPayment: 22000, discount: 75000 },
    { expectedPayment: 22200, discount: 71000 },
    { expectedPayment: 21150, discount: 92000 },
    { expectedPayment: 22750, discount: 60000 } // Inferred from payment 22750
];

async function verifyData() {
    try {
        // Fetch the test chit to ensure we use DB values
        const res = await pool.query("SELECT * FROM chits WHERE name = 'Test Chit 3%'");
        if (res.rows.length === 0) {
            console.error("Test Chit 3% not found!");
            return;
        }
        const chit = res.rows[0];
        const totalAmount = chit.total_amount; // 500000
        const commissionPercent = chit.commission_percent; // 3.0

        // We need member count. The calculator uses dynamic count.
        // For this test, we assume 20 members as per user request.
        // Let's verify if the chit has 20 members.
        const countRes = await pool.query('SELECT COUNT(*) FROM chit_members WHERE chit_id = $1', [chit.id]);
        const memberCount = parseInt(countRes.rows[0].count);

        console.log(`Verifying against Chit: ${chit.name}`);
        console.log(`Total: ${totalAmount}, Commission: ${commissionPercent}%, Members: ${memberCount}`);
        console.log('---------------------------------------------------');
        console.log('| Expected Payment | Discount | Prize (Input) | Calc Payment | Status |');
        console.log('| :--- | :--- | :--- | :--- | :--- |');

        let allPassed = true;

        for (const point of dataPoints) {
            const { expectedPayment, discount } = point;

            // Logic from Calculator.jsx
            const prizeAmount = totalAmount - discount;
            const commission = totalAmount * (commissionPercent / 100);
            const dividendPool = discount - commission;
            const dividendPerMember = memberCount > 0 ? dividendPool / memberCount : 0;
            const regularInstallment = totalAmount / memberCount;
            const calculatedPayment = regularInstallment - dividendPerMember;

            const match = Math.abs(calculatedPayment - expectedPayment) < 1; // Allow small float diff
            if (!match) allPassed = false;

            console.log(`| ₹${expectedPayment} | ₹${discount} | ₹${prizeAmount} | ₹${calculatedPayment} | ${match ? '✅ PASS' : '❌ FAIL'} |`);
        }
        console.log('---------------------------------------------------');

        if (allPassed) {
            console.log('\nAll data points verified successfully!');
        } else {
            console.log('\nSome data points failed verification.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

verifyData();
