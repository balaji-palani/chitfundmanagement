const API_URL = 'http://localhost:3001/api';

async function request(method, endpoint, data) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);

    const res = await fetch(`${API_URL}${endpoint}`, options);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${method} ${endpoint} failed: ${res.status} ${res.statusText} - ${text}`);
    }
    return res.json();
}

const get = (endpoint) => request('GET', endpoint);
const post = (endpoint, data) => request('POST', endpoint, data);

async function runTest() {
    console.log('🚀 Starting Comprehensive System Test...');
    const timestamp = Date.now();

    try {
        // 1. Create Member
        console.log('\n1. Testing Member Creation...');
        const member = await post('/members', {
            name: `Test User ${timestamp}`,
            contact: '9999999999',
            notes: 'Automated Test'
        });
        console.log('✅ Member Created:', member.id);

        // 2. Create Chit
        console.log('\n2. Testing Chit Creation...');
        const chit = await post('/chits', {
            name: `Test Chit ${timestamp}`,
            total_amount: 100000,
            duration_months: 20,
            start_date: new Date().toISOString().split('T')[0],
            commission_percent: 5.0
        });
        console.log('✅ Chit Created:', chit.id);

        // 3. Add Member to Chit
        console.log('\n3. Testing Adding Member to Chit...');
        await post(`/chits/${chit.id}/members`, { member_id: member.id });

        const members = await get(`/chits/${chit.id}/members`);
        if (members.find(m => m.id === member.id)) {
            console.log('✅ Member successfully added to Chit');
        } else {
            throw new Error('Member not found in chit');
        }

        // 4. Record Cycle
        console.log('\n4. Testing Cycle Recording...');
        const cycle = await post(`/chits/${chit.id}/cycles`, {
            month_number: 1,
            month_year: 'Test Month 2025',
            bid_amount: 5000,
            winner_member_id: member.id
        });
        console.log('✅ Cycle Recorded:', cycle.id);

        // 5. Test Payment Tracking
        console.log('\n5. Testing Payment Tracking...');
        await post(`/cycles/${cycle.id}/payments`, {
            member_id: member.id,
            status: 'paid'
        });

        const payments = await get(`/cycles/${cycle.id}/payments`);
        const payment = payments.find(p => p.member_id === member.id);
        if (payment && payment.status === 'paid') {
            console.log('✅ Payment successfully recorded');
        } else {
            throw new Error('Payment status mismatch');
        }

        // 6. Test Dashboard Stats
        console.log('\n6. Testing Dashboard Stats...');
        const stats = await get('/stats');
        if (stats.activeChits > 0 && stats.totalMembers > 0) {
            console.log('✅ Dashboard stats returning data:', stats);
        } else {
            throw new Error('Dashboard stats empty or zero');
        }

        // 7. Test Calculator API Support
        console.log('\n7. Testing Calculator API Support...');
        const chits = await get('/chits');
        const testChit = chits.find(c => c.id === chit.id);
        if (testChit && testChit.member_count === 1) {
            console.log('✅ Chit API returns correct member_count (1)');
        } else {
            throw new Error(`Expected member_count 1, got ${testChit ? testChit.member_count : 'undefined'}`);
        }

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        process.exit(1);
    }
}

runTest();
