const API_URL = 'http://localhost:3001/api';

async function get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.statusText}`);
    return res.json();
}

async function runTest() {
    try {
        console.log('Starting Dashboard Verification...');

        // Verify Stats Endpoint
        console.log('Fetching Stats...');
        const stats = await get(`${API_URL}/stats`);
        console.log('Stats received:', stats);

        if (stats.activeChits === 3) {
            console.log('PASS: Active Chits = 3');
        } else {
            console.error(`FAIL: Expected 3 active chits, got ${stats.activeChits}`);
        }

        if (stats.totalMembers === 60) {
            console.log('PASS: Total Members = 60');
        } else {
            console.error(`FAIL: Expected 60 members, got ${stats.totalMembers}`);
        }

        if (typeof stats.totalCollection === 'number') {
            console.log(`PASS: Total Collection is a number: ${stats.totalCollection}`);
        } else {
            console.error('FAIL: Total Collection is not a number');
        }

    } catch (err) {
        console.error('TEST FAILED:', err.message);
    }
}

runTest();
