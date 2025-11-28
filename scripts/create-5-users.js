// Using global fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';

// Helper to manage cookies per user session
function updateCookies(response, cookieStore) {
    if (typeof response.headers.getSetCookie === 'function') {
        const cookiesArray = response.headers.getSetCookie();
        cookiesArray.forEach(cookie => {
            const parts = cookie.split(';');
            const [name, value] = parts[0].split('=');
            cookieStore[name] = value;
        });
    } else {
        const cookieHeader = response.headers.get('set-cookie');
        if (cookieHeader) {
            const parts = cookieHeader.split(';');
            const [name, value] = parts[0].split('=');
            cookieStore[name] = value;
        }
    }
}

function getCookieString(cookieStore) {
    return Object.entries(cookieStore).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function request(method, path, body = null, token = null, cookieStore = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': getCookieString(cookieStore),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // console.log(`[${method}] ${path}`);
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    updateCookies(response, cookieStore);

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = text;
    }

    if (!response.ok) {
        console.error(`Error [${method} ${path}]:`, data);
        throw new Error(`Request failed: ${response.status}`);
    }
    return { status: response.status, data };
}

async function createFullUserFlow(index) {
    const cookieStore = {};
    let userToken = '';
    let salonId = '';

    const timestamp = Date.now();
    const userEmail = `user${index}_${timestamp}@example.com`;
    const password = 'Password123!';
    const salonName = `Salon ${index} - ${timestamp}`;

    console.log(`\n--- Starting User ${index}: ${userEmail} ---`);

    try {
        // 1. Register
        await request('POST', '/api/auth/register', {
            email: userEmail,
            password: password,
            firstName: `User${index}`,
            lastName: 'Test',
            role: 'SALON_OWNER'
        }, null, cookieStore);

        // 2. Login
        const loginRes = await request('POST', '/api/auth/login', {
            email: userEmail,
            password: password,
        }, null, cookieStore);
        userToken = loginRes.data.accessToken;

        // 3. Create Salon
        const salonPayload = {
            name: salonName,
            address: `${index} Test Street`,
            city: 'Pretoria',
            town: 'Hatfield',
            province: 'Gauteng',
            phone: `012345678${index}`,
            email: userEmail,
            description: `Description for ${salonName}`,
            offersMobile: index % 2 === 0, // Alternate mobile offers
            latitude: -25.7479 + (index * 0.01), // Slight location variation
            longitude: 28.2293 + (index * 0.01),
            planCode: 'STARTER',
            operatingHours: [
                { day: 'Monday', open: '09:00', close: '17:00' },
                { day: 'Tuesday', open: '09:00', close: '17:00' }
            ],
            operatingDays: ['Monday', 'Tuesday'],
            hasSentProof: true,
            paymentReference: `REF-${index}-${timestamp}`
        };

        const salonRes = await request('POST', '/api/salons', salonPayload, userToken, cookieStore);
        salonId = salonRes.data.id;
        console.log(`  > Salon Created: ${salonName} (${salonId})`);

        // 4. Add Services
        // Service 1: Photo-based
        await request('POST', '/api/services', {
            title: `Premium Cut ${index}`,
            description: 'Premium haircut service',
            price: 200 + (index * 10),
            duration: 60,
            salonId: salonId,
            images: ['https://placehold.co/600x400']
        }, userToken, cookieStore);
        console.log(`  > Service Added: Premium Cut ${index}`);

        // Service 2: Simple List
        await request('POST', '/api/services', {
            title: `Quick Trim ${index}`,
            description: 'Simple trim service',
            price: 100 + (index * 5),
            duration: 30,
            salonId: salonId,
            images: []
        }, userToken, cookieStore);
        console.log(`  > Service Added: Quick Trim ${index}`);

        console.log(`--- User ${index} Completed Successfully ---\n`);

    } catch (error) {
        console.error(`!!! User ${index} Failed !!!`);
        console.error(error);
    }
}

async function run() {
    console.log('=== CREATING 5 TEST USERS ===');

    // Run sequentially to avoid overwhelming the server or database locks
    for (let i = 1; i <= 5; i++) {
        await createFullUserFlow(i);
    }

    console.log('=== ALL DONE ===');
}

run();
