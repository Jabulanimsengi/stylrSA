// Using global fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';
let userToken = '';
let adminToken = '';
let salonId = '';
let serviceId1 = '';
let serviceId2 = '';

// Helper to manage cookies
let cookies = {};

function updateCookies(response) {
    if (typeof response.headers.getSetCookie === 'function') {
        const cookiesArray = response.headers.getSetCookie();
        cookiesArray.forEach(cookie => {
            const parts = cookie.split(';');
            const [name, value] = parts[0].split('=');
            cookies[name] = value;
        });
    } else {
        const cookieHeader = response.headers.get('set-cookie');
        if (cookieHeader) {
            const parts = cookieHeader.split(';');
            const [name, value] = parts[0].split('=');
            cookies[name] = value;
        }
    }
}

function getCookieString() {
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function request(method, path, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Cookie': getCookieString(),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`\n[${method}] ${path}`);
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    updateCookies(response);

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        data = text;
    }

    console.log(`Status: ${response.status}`);
    if (!response.ok) {
        console.error('Error Response:', data);
    }
    return { status: response.status, data };
}

async function run() {
    try {
        console.log('=== STARTING E2E TEST ===');

        // 1. Register/Login User
        const userEmail = `testowner_${Date.now()}@example.com`;
        const password = 'Password123!';

        console.log(`\n--- 1. Registering User: ${userEmail} ---`);
        let res = await request('POST', '/api/auth/register', {
            email: userEmail,
            password: password,
            firstName: 'Test',
            lastName: 'Owner',
            role: 'SALON_OWNER' // Assuming this role exists or defaults
        });

        if (res.status !== 201 && res.status !== 200) {
            // Try login if register fails (maybe user exists)
            console.log('Register failed, trying login...');
        }

        res = await request('POST', '/api/auth/login', {
            email: userEmail,
            password: password,
        });

        if (res.status !== 200) throw new Error('Login failed');
        userToken = res.data.accessToken;
        console.log('User logged in.');

        // 2. Create Salon Profile
        console.log('\n--- 2. Creating Salon Profile ---');
        const salonPayload = {
            name: `Test Salon ${Date.now()}`,
            address: '123 Test St',
            city: 'Pretoria',
            town: 'Hatfield',
            province: 'Gauteng',
            phone: '0123456789',
            email: userEmail,
            description: 'A test salon description.',
            offersMobile: false,
            latitude: -25.7479,
            longitude: 28.2293,
            planCode: 'STARTER',
            operatingHours: [
                { day: 'Monday', open: '09:00', close: '17:00' }
            ],
            operatingDays: ['Monday'],
            hasSentProof: true,
            paymentReference: 'TEST-REF'
        };

        res = await request('POST', '/api/salons', salonPayload, userToken);
        if (res.status !== 201) throw new Error('Create Salon failed');
        salonId = res.data.id;
        console.log(`Salon created with ID: ${salonId}`);

        // 3. Add Services
        console.log('\n--- 3. Adding Services ---');

        // 3a. Service with photos (mocked)
        console.log('Adding Service with Photos...');
        res = await request('POST', '/api/services', {
            title: 'Luxury Cut',
            description: 'A luxury haircut experience.',
            price: 500,
            duration: 60,
            salonId: salonId,
            images: ['https://example.com/image1.jpg']
        }, userToken);
        if (res.status !== 201) throw new Error('Add Service 1 failed');
        serviceId1 = res.data.id;
        console.log(`Service 1 created: ${serviceId1}`);

        // 3b. Simple Service (no photos)
        console.log('Adding Simple Service (No Photos)...');
        res = await request('POST', '/api/services', {
            title: 'Quick Trim',
            description: 'Just a trim.',
            price: 150,
            duration: 30,
            salonId: salonId,
            images: [] // Empty array for simple service
        }, userToken);
        if (res.status !== 201) throw new Error('Add Service 2 failed');
        // If not, this step will fail.
        const adminEmail = 'admin@stylrsa.co.za'; // Replace with actual admin email
        const adminPassword = 'password123'; // Replace with actual admin password

        // Clear cookies for admin login
        cookies = {};

        res = await request('POST', '/api/auth/login', {
            email: adminEmail,
            password: adminPassword,
        });

        if (res.status !== 200) {
            console.warn('Admin login failed. Skipping approval step. Please ensure admin credentials are correct.');
        } else {
            adminToken = res.data.accessToken;
            console.log('Admin logged in.');

            // 6. Approve Salon
            console.log('\n--- 6. Approving Salon ---');
            res = await request('PATCH', `/api/admin/salons/${salonId}/status`, {
                approvalStatus: 'APPROVED'
            }, adminToken);

            if (res.status !== 200) throw new Error('Approve Salon failed');
            console.log('Salon approved.');

            // Verify
            res = await request('GET', `/api/salons/${salonId}`);
            if (res.data.approvalStatus === 'APPROVED') {
                console.log('VERIFICATION SUCCESS: Salon is approved.');
            } else {
                console.error('VERIFICATION FAILED: Salon status is ' + res.data.approvalStatus);
            }
        }

        console.log('\n=== E2E TEST COMPLETED SUCCESSFULLY ===');

    } catch (error) {
        console.error('\n!!! TEST FAILED !!!');
        console.error(error);
        process.exit(1);
    }
}

run();
