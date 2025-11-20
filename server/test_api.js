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
        console.log('Starting API Verification...');

        // 1. Create Member
        console.log('Creating Member...');
        const member = await post(`${API_URL}/members`, {
            name: 'John Doe',
            contact: '9876543210',
            notes: 'Test Member'
        });
        const memberId = member.id;
        console.log('Member Created:', memberId);

        // 2. Create Chit
        console.log('Creating Chit...');
        const chit = await post(`${API_URL}/chits`, {
            name: 'September 5L Group',
            total_amount: 500000,
            duration_months: 20,
            start_date: '2025-09-01'
        });
        const chitId = chit.id;
        console.log('Chit Created:', chitId);

        // 3. Add Member to Chit
        console.log('Adding Member to Chit...');
        await post(`${API_URL}/chits/${chitId}/members`, {
            member_id: memberId
        });
        console.log('Member Added to Chit');

        // 4. Record Cycle
        console.log('Recording Cycle...');
        await post(`${API_URL}/chits/${chitId}/cycles`, {
            month_number: 1,
            month_year: 'September 2025',
            bid_amount: 71000,
            winner_member_id: memberId
        });
        console.log('Cycle Recorded');

        // 5. Get Summary
        console.log('Fetching Summary...');
        const summaryData = await get(`${API_URL}/summary?month_year=September 2025`);
        const summary = summaryData[0];

        console.log('Summary Data:', summary);

        if (!summary) {
            throw new Error('No summary data found');
        }

        // Verify Calculations
        const commission = summary.total_amount * 0.05; // 25000
        const dividendPool = summary.bid_amount - commission; // 71000 - 25000 = 46000
        const memberCount = summary.member_count; // 1
        const dividend = dividendPool / memberCount; // 46000
        const payable = (summary.total_amount / memberCount) - dividend; // 500000 - 46000 = 454000

        console.log('--- Verification ---');
        console.log(`Total: ${summary.total_amount}`);
        console.log(`Bid: ${summary.bid_amount}`);
        console.log(`Commission (5%): ${commission}`);
        console.log(`Dividend Pool: ${dividendPool}`);
        console.log(`Members: ${memberCount}`);
        console.log(`Dividend/Member: ${dividend}`);
        console.log(`Payable: ${payable}`);

        if (summary.chit_name === 'September 5L Group') {
            console.log('TEST PASSED');
        } else {
            console.error('TEST FAILED: Chit name mismatch');
        }

    } catch (err) {
        console.error('TEST FAILED:', err.message);
    }
}

runTest();
