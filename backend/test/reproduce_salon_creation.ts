
// import { fetch } from 'undici'; // Built-in in Node 18+

const BASE_URL = 'http://127.0.0.1:5000';

async function run() {
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

    if (!registerRes.ok) {
        console.error('Registration failed:', await registerRes.text());
        return;
    }
    console.log('Registration successful');

    console.log('2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }

    // Extract cookie
    const cookieHeader = loginRes.headers.get('set-cookie');
    console.log('Login successful. Set-Cookie:', cookieHeader);

    if (!cookieHeader) {
        console.error('No cookie received!');
        return;
    }

    // Simple cookie parsing (taking the first part)
    const accessToken = cookieHeader.split(';')[0];
    console.log('Using cookie:', accessToken);

    console.log('3. Creating Salon...');
    const salonPayload = {
        name: `Test Salon ${Date.now()}`,
        description: 'A test salon description',
        province: 'Gauteng',
        city: 'Johannesburg',
        town: 'Sandton',
        address: '123 Test St',
        latitude: -26.1,
        longitude: 28.0,
        planCode: 'STARTER',
        phone: '0821234567',
        email: email, // Use the registered email
        bookingType: 'ONSITE',
        operatingHours: [], // Defaults will be handled
        operatingDays: ['Monday', 'Tuesday']
    };

    const createRes = await fetch(`${BASE_URL}/api/salons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': accessToken
        },
        body: JSON.stringify(salonPayload)
    });

    console.log('Create Salon Status:', createRes.status);
    const createBody = await createRes.text();
    console.log('Create Salon Body:', createBody);
}

run().catch(console.error);
