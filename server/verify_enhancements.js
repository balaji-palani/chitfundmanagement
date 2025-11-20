const API_URL = 'http://localhost:3001/api';

async function post(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.statusText}`);
    return res.json();
}

async function get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.statusText}`);
    return res.json();
}

async function runTest() {
    try {
        console.log('Starting Enhancement Verification...');

        // 1. Verify Seeded Chits
        console.log('Fetching Chits...');
        const chits = await get(`${API_URL}/chits`);
        console.log(`Found ${chits.length} chits.`);

        const chit1L = chits.find(c => c.name === '1L Chit Group');
        if (chit1L && chit1L.commission_percent === 5.0) {
            console.log('PASS: 1L Chit exists with 5% commission');
        } else {
            console.error('FAIL: 1L Chit missing or incorrect commission');
        }

        // 2. Verify Members in Chit
        console.log('Fetching Members for 1L Chit...');
        const members = await get(`${API_URL}/chits/${chit1L.id}/members`);
        console.log(`Found ${members.length} members.`);
        if (members.length === 20) {
            console.log('PASS: 1L Chit has 20 members');
        } else {
            console.error(`FAIL: Expected 20 members, found ${members.length}`);
        }

        // 3. Record Cycle and Verify Payments
        console.log('Recording Cycle for 1L Chit...');
        const cycle = await post(`${API_URL}/chits/${chit1L.id}/cycles`, {
            month_number: 1,
            month_year: 'October 2025',
            bid_amount: 5000,
            winner_member_id: members[0].id
        });
        console.log('Cycle Recorded:', cycle.id);

        // 4. Mark Payment
        console.log('Marking payment for Member 2...');
        await post(`${API_URL}/cycles/${cycle.id}/payments`, {
            member_id: members[1].id,
            status: 'paid'
        });

        // 5. Verify Payment Status
        console.log('Verifying Payment Status...');
        const payments = await get(`${API_URL}/cycles/${cycle.id}/payments`);
        const paidMember = payments.find(p => p.member_id === members[1].id);

        if (paidMember && paidMember.status === 'paid') {
            console.log('PASS: Member 2 payment recorded');
        } else {
            console.error('FAIL: Payment not recorded');
        }

        // 6. Verify Summary Calculation
        console.log('Verifying Summary...');
        const summaryData = await get(`${API_URL}/summary?month_year=October 2025`);
        const summary = summaryData.find(s => s.chit_name === '1L Chit Group');

        if (summary) {
            // 1L Chit, 5% comm = 5000. Bid 5000.
            // Commission Amount = 5000.
            // Dividend Pool = 5000 - 5000 = 0.
            // Payable = (100000 / 20) - 0 = 5000.

            console.log('Summary:', summary);
            if (summary.commission_amount === 5000) {
                console.log('PASS: Commission calculated correctly');
            } else {
                console.error(`FAIL: Expected 5000 commission, got ${summary.commission_amount}`);
            }
        } else {
            console.error('FAIL: Summary not found');
        }

    } catch (err) {
        console.error('TEST FAILED:', err.message);
    }
}

runTest();
