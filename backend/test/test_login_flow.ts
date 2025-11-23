// Test login flow through frontend proxy
const BASE_URL = 'http://localhost:3000';

async function testLoginFlow() {
    const email = `test${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log(`1. Registering user: ${email}`);
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            firstName: 'Test',
            lastName: 'User',
            role: 'SALON_OWNER'
        })
    });

    console.log('Register status:', registerRes.status);
    console.log('Register headers:', Object.fromEntries(registerRes.headers.entries()));

    if (!registerRes.ok) {
        console.error('Registration failed:', await registerRes.text());
        return;
    }
    console.log('✓ Registration successful');

    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    console.log('Login status:', loginRes.status);
    console.log('Login headers:', Object.fromEntries(loginRes.headers.entries()));
    const setCookieHeader = loginRes.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    if (!setCookieHeader) {
        console.error('❌ NO SET-COOKIE HEADER IN LOGIN RESPONSE!');
        return;
    }

    console.log('✓ Login successful with cookie');
}

testLoginFlow().catch(console.error);
