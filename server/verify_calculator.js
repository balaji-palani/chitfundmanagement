const API_URL = 'http://localhost:3001/api';

async function get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.statusText}`);
    return res.json();
}

async function runTest() {
    try {
        console.log('Starting Calculator API Verification...');

        // Verify Chits Endpoint returns member_count
        console.log('Fetching Chits...');
        const chits = await get(`${API_URL}/chits`);

        if (chits.length === 0) {
            console.error('FAIL: No chits found');
            return;
        }

        const chit = chits[0];
        console.log('Chit Data:', chit);

        if (chit.member_count !== undefined) {
            console.log(`PASS: Chit has member_count: ${chit.member_count}`);
        } else {
            console.error('FAIL: Chit missing member_count');
        }

        if (chit.member_count === 20) {
            console.log('PASS: Member count is correct (20)');
        } else {
            console.warn(`WARN: Expected 20 members, got ${chit.member_count}`);
        }

    } catch (err) {
        console.error('TEST FAILED:', err.message);
    }
}

runTest();
