const API_URL = 'http://localhost:3001/api';

async function verifyAdminLogic() {
    try {
        console.log('1. Logging in as Admin...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${adminLoginRes.statusText}`);
        const adminData = await adminLoginRes.json();
        const adminToken = adminData.token;
        console.log('   Success! Admin Token received.');

        console.log('2. Creating new user as Admin...');
        const newUser = {
            username: 'verified_user',
            password: 'password123',
            role: 'user'
        };

        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(newUser)
        });

        if (registerRes.ok) {
            console.log('   Success! New user created.');
        } else {
            const errData = await registerRes.json();
            if (registerRes.status === 400 && errData.error === 'Username already exists') {
                console.log('   User already exists, proceeding...');
            } else {
                throw new Error(`Registration failed: ${JSON.stringify(errData)}`);
            }
        }

        console.log('3. Logging in as New User...');
        const userLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'verified_user', password: 'password123' })
        });

        if (!userLoginRes.ok) throw new Error(`User login failed: ${userLoginRes.statusText}`);
        const userData = await userLoginRes.json();
        const userToken = userData.token;
        console.log('   Success! User Token received.');

        console.log('4. Attempting to create user as Non-Admin...');
        const failRegisterRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ username: 'hacker_user', password: 'password123' })
        });

        if (failRegisterRes.status === 403) {
            console.log('   Success! Access denied (403) as expected.');
        } else {
            console.error(`   FAILED! Non-admin response status: ${failRegisterRes.status}`);
            process.exit(1);
        }

        console.log('\nVerification PASSED: RBAC logic is correct.');

    } catch (err) {
        console.error('\nVerification FAILED:', err.message);
        process.exit(1);
    }
}

verifyAdminLogic();
