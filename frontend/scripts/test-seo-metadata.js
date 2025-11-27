const http = require('http');

const baseUrl = 'http://localhost:3001';

const pagesToTest = [
    { path: '/salons/location/gauteng', expectedTitle: 'Best Hair Salons & Spas in Gauteng | Stylr SA' },
    { path: '/salons/location/gauteng/pretoria', expectedTitle: 'Best Hair Salons & Spas in Pretoria, Gauteng | Stylr SA' },
    { path: '/salons/near-me', expectedTitle: 'Hair Salons Near Me | Find Best Salons & Spas Nearby | Stylr SA' },
];

async function fetchPage(path) {
    return new Promise((resolve, reject) => {
        http.get(`${baseUrl}${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
            res.on('error', (err) => reject(err));
        });
    });
}

async function runTests() {
    console.log('Starting SEO Metadata Verification...');
    console.log('Ensure your local server is running at http://localhost:3001');

    let passed = 0;
    let failed = 0;

    for (const page of pagesToTest) {
        try {
            console.log(`\nTesting ${page.path}...`);
            const { status, body } = await fetchPage(page.path);

            if (status !== 200) {
                console.error(`❌ Failed to fetch page. Status: ${status}`);
                failed++;
                continue;
            }

            const titleMatch = body.match(/<title>(.*?)<\/title>/);
            const rawTitle = titleMatch ? titleMatch[1] : 'No title found';
            // Decode HTML entities
            const title = rawTitle.replace(/&amp;/g, '&');

            if (title === page.expectedTitle) {
                console.log(`✅ Title matches: "${title}"`);
                passed++;
            } else {
                console.error(`❌ Title Mismatch!`);
                console.error(`   Expected: "${page.expectedTitle}"`);
                console.error(`   Actual:   "${title}"`);
                failed++;
            }

            // Check for canonical
            const canonicalMatch = body.match(/<link rel="canonical" href="(.*?)"/);
            if (canonicalMatch) {
                console.log(`✅ Canonical found: ${canonicalMatch[1]}`);
            } else {
                console.warn(`⚠️ No canonical tag found`);
            }

        } catch (error) {
            console.error(`❌ Error testing ${page.path}:`, error.message);
            failed++;
        }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
}

runTests();
