#!/usr/bin/env node

/**
 * Page Warming Script for SEO Pages
 * 
 * This script warms up ISR-generated pages by making HTTP requests to each URL,
 * triggering Next.js to generate and cache the pages.
 * 
 * Usage:
 *   node scripts/warm-pages.js                    # Warm all pages
 *   node scripts/warm-pages.js --limit 1000       # Warm first 1000 pages
 *   node scripts/warm-pages.js --concurrency 5   # 5 concurrent requests
 *   node scripts/warm-pages.js --dry-run          # Just show URLs without fetching
 *   node scripts/warm-pages.js --start-from 5000  # Start from page 5000
 * 
 * Estimated URLs: ~350 keywords × (1 + 9 provinces + 183 cities) = ~67,550 pages
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://www.stylrsa.co.za';
const DEFAULT_CONCURRENCY = 3;
const DEFAULT_DELAY_MS = 100;
const REQUEST_TIMEOUT_MS = 30000;

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const LIMIT = getArg('limit') ? parseInt(getArg('limit'), 10) : null;
const CONCURRENCY = getArg('concurrency') ? parseInt(getArg('concurrency'), 10) : DEFAULT_CONCURRENCY;
const DRY_RUN = hasFlag('dry-run');
const START_FROM = getArg('start-from') ? parseInt(getArg('start-from'), 10) : 0;
const KEYWORD_FILTER = getArg('keyword') || null;
const PROVINCE_FILTER = getArg('province') || null;

// ===============================================
// SEO Keywords - Comprehensive list for 60K+ pages
// ~350 keywords for target of 60,000+ URLs
// ===============================================
const SEO_KEYWORDS = [
    // ===============================
    // HAIR & BRAIDING (Core)
    // ===============================
    'hair-salon', 'braiding', 'box-braids', 'knotless-braids', 'cornrows', 'sew-in',
    'weave-installation', 'faux-locs', 'dreadlocks', 'twist-out', 'silk-press',
    'hair-relaxer', 'keratin-treatment', 'hair-color', 'balayage', 'hair-extensions',
    'natural-hair-salon', 'afro-hair-salon', 'loc-retwist', 'crochet-braids',
    'tribal-braids', 'fulani-braids', 'ghana-braids', 'lemonade-braids', 'stitch-braids',
    'passion-twists', 'senegalese-twists', 'marley-twists', 'spring-twists', 'butterfly-locs',
    'goddess-locs', 'soft-locs', 'boho-braids', 'bohemian-braids', 'gypsy-braids',
    'feed-in-braids', 'jumbo-braids', 'micro-braids', 'pop-smoke-braids', 'cleopatra-braids',
    'bantu-knots', 'finger-waves', 'pin-curls', 'roller-set', 'flexi-rod-set',
    'blow-dry', 'blow-wave', 'blowout', 'brazilian-blowout', 'dominican-blowout',
    'hair-highlights', 'lowlights', 'ombre-hair', 'ombre-color', 'fashion-colors',
    'color-correction', 'grey-coverage', 'root-touch-up', 'toner', 'decolorizer',
    'closure-installation', 'frontal-installation', 'wig-installation', 'wig-styling',
    'ponytail-installation', 'sleek-ponytail', 'kinky-ponytail', 'gypsy-ponytail',
    'deep-conditioning', 'protein-treatment', 'olaplex', 'hair-botox', 'moisture-treatment',
    'hot-oil-treatment', 'scalp-treatment', 'hair-steaming', 'bond-repair-treatment',
    'trim', 'layered-haircut', 'bob-haircut', 'pixie-cut', 'updo', 'formal-hair',
    'bridal-hair', 'wedding-hair', 'prom-hair', 'matric-dance-hair',
    'kids-braids', 'kids-hairstyles', 'kids-cornrows', 'kids-box-braids', 'kiddies-hair',
    'straight-back-cornrows', 'sleek-straight-up', 'straight-up', 'dolamo-ponytail',
    'katy-perry-ponytail', 'croissant-ponytail', 'jozi-dreads', 'jozi-ponytail',
    'invisible-locs', 'invisible-twists', 'distressed-locs', 'interlocking-locs',
    'starter-locs', 'loc-maintenance', 'loc-twist', 'sisterlocks', 'dreadlock-wash',
    'wash-and-go', 'wash-and-set', 'wash-and-blow-dry', 'naturalista', 'natural-twists',

    // ===============================
    // BARBERING (Core)
    // ===============================
    'barbershop', 'barber', 'fade-haircut', 'beard-trim', 'mens-haircut',
    'skin-fade', 'taper-fade', 'line-up', 'shape-up', 'hot-towel-shave',
    'bald-fade', 'high-fade', 'mid-fade', 'low-fade', 'drop-fade',
    'buzz-cut', 'crew-cut', 'mohawk', 'waves', 'waves-haircut', 'chiskop',
    'afro-haircut', 'hair-design', 'hair-tattoo', 'male-cornrows',
    'beard-grooming', 'beard-shaping', 'beard-dye', 'straight-razor-shave',
    'kids-barber', 'boys-haircut', 'mobile-barber', 'toddler-haircut',

    // ===============================
    // NAILS (Core)
    // ===============================
    'nail-salon', 'acrylic-nails', 'gel-nails', 'manicure', 'pedicure',
    'nail-art', 'sns-nails', 'dip-powder-nails', 'nail-tech', 'french-tips',
    'mani-pedi', 'gel-pedicure', 'nail-extensions', 'nail-fill', 'infill',
    'polygel-nails', 'builder-gel', 'biab-nails', 'shellac-nails', 'chrome-nails',
    'ombre-nails', 'coffin-nails', 'stiletto-nails', 'almond-nails', 'square-nails',
    'ballerina-nails', 'long-nails', 'short-nails', 'bridal-nails', 'nail-repair',
    'soak-off', 'nail-removal', 'express-manicure', 'express-pedicure',
    'callus-removal', 'paraffin-wax-treatment', 'press-on-nails',

    // ===============================
    // BEAUTY, MAKEUP & LASHES
    // ===============================
    'makeup-artist', 'bridal-makeup', 'wedding-makeup', 'prom-makeup',
    'glam-makeup', 'soft-glam', 'natural-makeup-look', 'airbrush-makeup',
    'party-makeup', 'photoshoot-makeup', 'editorial-makeup', 'hd-makeup',
    'matric-dance-makeup', 'special-occasion-makeup', 'mobile-makeup-artist',
    'lash-extensions', 'eyelash-extensions', 'classic-lashes', 'volume-lashes',
    'hybrid-lashes', 'mega-volume-lashes', 'lash-lift', 'lash-perm', 'lash-tint',
    'lash-fill', 'lash-refill', 'lash-removal', 'russian-lashes', 'wispy-lashes',
    'cat-eye-lashes', 'doll-eye-lashes', 'natural-lashes', 'strip-lashes',
    'brow-lamination', 'microblading', 'microshading', 'powder-brows', 'ombre-brows',
    'eyebrow-threading', 'eyebrow-tinting', 'eyebrow-waxing', 'brow-shaping',
    'henna-brows', 'combo-brows', 'nanoblading', 'eyebrow-tattoo', 'brow-mapping',

    // ===============================
    // SPA, MASSAGE & WELLNESS
    // ===============================
    'spa', 'day-spa', 'massage', 'full-body-massage', 'deep-tissue-massage',
    'swedish-massage', 'hot-stone-massage', 'aromatherapy-massage', 'couples-massage',
    'relaxation-massage', 'sports-massage', 'thai-massage', 'pregnancy-massage',
    'prenatal-massage', 'lymphatic-drainage-massage', 'reflexology', 'back-massage',
    'head-massage', 'neck-and-shoulder-massage', 'foot-massage', 'indian-head-massage',
    'cupping-therapy', 'bamboo-massage', 'remedial-massage', 'spa-packages',

    // ===============================
    // SKINCARE & FACIALS
    // ===============================
    'facial', 'hydrafacial', 'deep-cleansing-facial', 'anti-aging-facial',
    'acne-facial', 'teen-facial', 'express-facial', 'deluxe-facial', 'oxygen-facial',
    'led-light-therapy', 'dermaplaning', 'microdermabrasion', 'chemical-peel',
    'enzyme-facial', 'vitamin-c-facial', 'brightening-facial', 'blackhead-removal',
    'pore-extraction', 'back-facial', 'mens-facial', 'signature-facial',

    // ===============================
    // WAXING & HAIR REMOVAL
    // ===============================
    'waxing', 'brazilian-wax', 'bikini-wax', 'hollywood-wax', 'full-body-wax',
    'leg-waxing', 'arm-waxing', 'underarm-wax', 'face-waxing', 'upper-lip-wax',
    'chin-wax', 'back-wax', 'chest-wax', 'mens-waxing', 'sugaring', 'threading',
    'laser-hair-removal', 'ipl-treatment', 'electrolysis',

    // ===============================
    // AESTHETICS & COSMETIC TREATMENTS
    // ===============================
    'botox', 'lip-fillers', 'dermal-fillers', 'cheek-fillers', 'jawline-filler',
    'chin-filler', 'under-eye-filler', 'tear-trough-filler', 'nose-filler',
    'microneedling', 'prp-treatment', 'vampire-facial', 'coolsculpting', 'fat-freezing',
    'body-contouring', 'skin-tightening', 'hifu-treatment', 'radio-frequency',
    'acne-scar-treatment', 'pigmentation-treatment', 'stretch-mark-treatment',
    'scar-treatment', 'skin-clinic', 'anti-wrinkle-injections', 'lipo-laser',

    // ===============================
    // NEAR ME KEYWORDS (High Volume)
    // ===============================
    'hair-salon-near-me', 'nail-salon-near-me', 'barbershop-near-me', 'spa-near-me',
    'braiding-near-me', 'makeup-artist-near-me', 'lash-tech-near-me', 'beauty-salon-near-me',
    'massage-near-me', 'waxing-near-me', 'facial-near-me', 'barber-near-me',
    'salon-near-me', 'stylist-near-me', 'hairdresser-near-me',
    'hair-braiding-near-me', 'box-braids-near-me', 'knotless-braids-near-me',
    'cornrows-near-me', 'dreadlocks-near-me', 'locs-near-me', 'faux-locs-near-me',
    'weave-salon-near-me', 'silk-press-near-me', 'keratin-treatment-near-me',
    'balayage-near-me', 'hair-color-near-me', 'hair-extensions-near-me',
    'natural-hair-salon-near-me', 'afro-hair-salon-near-me', 'curly-hair-salon-near-me',
    'nail-tech-near-me', 'acrylic-nails-near-me', 'gel-nails-near-me',
    'manicure-near-me', 'pedicure-near-me', 'mani-pedi-near-me', 'nail-art-near-me',
    'lash-extensions-near-me', 'eyelash-extensions-near-me', 'lash-lift-near-me',
    'brow-lamination-near-me', 'microblading-near-me', 'eyebrow-threading-near-me',
    'day-spa-near-me', 'couples-massage-near-me', 'deep-tissue-massage-near-me',
    'full-body-massage-near-me', 'hot-stone-massage-near-me', 'reflexology-near-me',
    'hydrafacial-near-me', 'chemical-peel-near-me', 'microneedling-near-me',
    'dermaplaning-near-me', 'microdermabrasion-near-me', 'laser-hair-removal-near-me',
    'botox-near-me', 'lip-fillers-near-me', 'dermal-fillers-near-me',

    // ===============================
    // SALON TYPES & MODIFIERS
    // ===============================
    'beauty-salon', 'best-salon', 'affordable-salon', 'luxury-salon', 'premium-salon',
    'mobile-hairstylist', 'mobile-service', 'home-salon', 'house-call',
    'mens-salon', 'ladies-salon', 'unisex-salon', 'black-owned-salon',
    'walk-in-salon', 'same-day-appointment', 'late-night-salon', 'open-sunday-salon',
    'salon-suite', 'full-service-salon', 'cheap-salon', 'emergency-hair-appointment',
];

// Province and City Data
const PROVINCES = {
    gauteng: {
        slug: 'gauteng',
        cities: [
            'johannesburg', 'sandton', 'pretoria', 'soweto', 'alexandra', 'katlehong',
            'tembisa', 'vosloorus', 'thokoza', 'daveyton', 'diepsloot', 'fourways',
            'midrand', 'randburg', 'roodepoort', 'krugersdorp', 'benoni', 'boksburg',
            'germiston', 'springs', 'alberton', 'edenvale', 'kempton-park',
            'vanderbijlpark', 'vereeniging', 'centurion', 'mamelodi', 'atteridgeville',
            'soshanguve', 'rosebank', 'melrose', 'hyde-park', 'bryanston',
            'pretoria-central', 'johannesburg-cbd', 'hatfield', 'menlyn', 'brooklyn',
            'arcadia', 'sunnyside', 'lynnwood', 'waterkloof', 'garsfontein', 'montana',
            'braamfontein', 'melville', 'parkhurst', 'rivonia', 'bedfordview', 'norwood',
            'northcliff', 'orlando', 'diepkloof', 'protea-glen', 'meadowlands',
            'sandton-city', 'mall-of-africa', 'menlyn-mall', 'eastgate', 'brooklyn-mall',
            'maponya-mall', 'hammanskraal', 'mabopane', 'ga-rankuwa', 'winterveld',
            'etwatwa', 'duduza', 'kwathema', 'randfontein', 'sebokeng', 'evaton', 'sharpeville'
        ]
    },
    'western-cape': {
        slug: 'western-cape',
        cities: [
            'cape-town', 'stellenbosch', 'somerset-west', 'cape-town-cbd', 'sea-point',
            'camps-bay', 'claremont', 'constantia', 'bellville', 'century-city',
            'tyger-valley', 'table-view', 'blouberg', 'khayelitsha', 'mitchells-plain',
            'gugulethu', 'waterfront', 'canal-walk', 'cavendish-square', 'paarl',
            'george', 'mossel-bay', 'knysna', 'hermanus', 'worcester'
        ]
    },
    'kwazulu-natal': {
        slug: 'kwazulu-natal',
        cities: [
            'durban', 'pietermaritzburg', 'umhlanga', 'durban-north', 'westville',
            'pinetown', 'ballito', 'chatsworth', 'phoenix', 'umlazi', 'kwamashu',
            'gateway', 'pavilion', 'newcastle', 'richards-bay', 'ladysmith',
            'port-shepstone', 'scottburgh', 'amanzimtoti'
        ]
    },
    'eastern-cape': {
        slug: 'eastern-cape',
        cities: [
            'gqeberha', 'east-london', 'mdantsane', 'motherwell', 'kwanobuhle',
            'zwide', 'new-brighton', 'uitenhage', 'grahamstown', 'vincent',
            'beacon-bay', 'mthatha', 'queenstown', 'king-williams-town'
        ]
    },
    'free-state': {
        slug: 'free-state',
        cities: [
            'bloemfontein', 'welkom', 'botshabelo', 'thaba-nchu', 'qwaqwa',
            'sasolburg', 'kroonstad', 'bethlehem', 'virginia', 'parys'
        ]
    },
    limpopo: {
        slug: 'limpopo',
        cities: [
            'polokwane', 'tzaneen', 'seshego', 'mankweng', 'thohoyandou',
            'giyani', 'lephalale', 'mokopane', 'louis-trichardt', 'phalaborwa',
            'burgersfort', 'modjadjiskloof'
        ]
    },
    mpumalanga: {
        slug: 'mpumalanga',
        cities: [
            'mbombela', 'witbank', 'kwamuhlanga', 'malelane', 'secunda',
            'middelburg-mp', 'ermelo', 'white-river', 'standerton', 'lydenburg',
            'barberton', 'hazyview'
        ]
    },
    'north-west': {
        slug: 'north-west',
        cities: [
            'rustenburg', 'potchefstroom', 'klerksdorp', 'mmabatho', 'mahikeng',
            'ikageng', 'jouberton', 'brits', 'sun-city', 'hartbeespoort',
            'orkney', 'lichtenburg'
        ]
    },
    'northern-cape': {
        slug: 'northern-cape',
        cities: [
            'kimberley', 'upington', 'springbok', 'kuruman', 'de-aar',
            'kathu', 'galeshewe'
        ]
    }
};

/**
 * Generate all SEO page URLs
 */
function generateUrls() {
    const urls = [];

    const keywords = KEYWORD_FILTER
        ? SEO_KEYWORDS.filter(k => k.includes(KEYWORD_FILTER))
        : SEO_KEYWORDS;

    const provinces = PROVINCE_FILTER
        ? Object.entries(PROVINCES).filter(([slug]) => slug.includes(PROVINCE_FILTER))
        : Object.entries(PROVINCES);

    // Generate /{keyword} pages (keyword-only)
    for (const keyword of keywords) {
        urls.push(`/${keyword}`);
    }

    // Generate /{keyword}/{province} pages
    for (const keyword of keywords) {
        for (const [provinceSlug] of provinces) {
            urls.push(`/${keyword}/${provinceSlug}`);
        }
    }

    // Generate /{keyword}/{province}/{city} pages
    for (const keyword of keywords) {
        for (const [provinceSlug, provinceData] of provinces) {
            for (const city of provinceData.cities) {
                urls.push(`/${keyword}/${provinceSlug}/${city}`);
            }
        }
    }

    return urls;
}

/**
 * Make HTTP request to warm a page
 */
function warmUrl(url) {
    return new Promise((resolve) => {
        const fullUrl = `${BASE_URL}${url}`;
        const protocol = fullUrl.startsWith('https') ? https : http;

        const req = protocol.get(fullUrl, { timeout: REQUEST_TIMEOUT_MS }, (res) => {
            res.on('data', () => { });
            res.on('end', () => {
                resolve({
                    url,
                    status: res.statusCode,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                url,
                status: 0,
                success: false,
                error: err.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                url,
                status: 0,
                success: false,
                error: 'Timeout'
            });
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processUrls(urls, concurrency) {
    const results = { total: urls.length, success: 0, failed: 0, errors: [] };
    const startTime = Date.now();
    let completed = 0;

    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency);

        if (DRY_RUN) {
            batch.forEach(url => console.log(`[DRY RUN] ${url}`));
            completed += batch.length;
        } else {
            const batchResults = await Promise.all(batch.map(warmUrl));

            for (const result of batchResults) {
                completed++;
                if (result.success) {
                    results.success++;
                } else {
                    results.failed++;
                    if (results.errors.length < 50) results.errors.push(result);
                }

                if (completed % 100 === 0 || completed === urls.length) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const rate = completed / elapsed;
                    const eta = (urls.length - completed) / rate;
                    console.log(
                        `Progress: ${completed}/${urls.length} (${((completed / urls.length) * 100).toFixed(1)}%) | ` +
                        `✓ ${results.success} ✗ ${results.failed} | Rate: ${rate.toFixed(1)}/s | ETA: ${formatTime(eta)}`
                    );
                }
            }
        }

        if (!DRY_RUN && i + concurrency < urls.length) await sleep(DEFAULT_DELAY_MS);
    }

    return results;
}

function formatTime(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
}

async function main() {
    console.log('🔥 Page Warming Script for Stylr SA');
    console.log('====================================\n');

    console.log('📋 Generating URL list...');
    let urls = generateUrls();

    console.log(`   Total URLs generated: ${urls.length.toLocaleString()}`);
    console.log(`   Keywords: ${SEO_KEYWORDS.length}`);
    console.log(`   Provinces: ${Object.keys(PROVINCES).length}`);
    const totalCities = Object.values(PROVINCES).reduce((sum, p) => sum + p.cities.length, 0);
    console.log(`   Cities: ${totalCities}`);

    if (START_FROM > 0) {
        urls = urls.slice(START_FROM);
        console.log(`   Starting from index: ${START_FROM}`);
    }

    if (LIMIT && LIMIT < urls.length) {
        urls = urls.slice(0, LIMIT);
        console.log(`   Limited to: ${LIMIT} URLs`);
    }

    if (KEYWORD_FILTER) console.log(`   Keyword filter: ${KEYWORD_FILTER}`);
    if (PROVINCE_FILTER) console.log(`   Province filter: ${PROVINCE_FILTER}`);

    console.log(`\n🌐 Base URL: ${BASE_URL}`);
    console.log(`⚡ Concurrency: ${CONCURRENCY}`);
    console.log(`📊 Pages to warm: ${urls.length.toLocaleString()}`);

    if (DRY_RUN) console.log(`\n🔍 DRY RUN MODE - No actual requests\n`);

    console.log('\n🚀 Starting page warming...\n');

    const results = await processUrls(urls, CONCURRENCY);

    console.log('\n====================================');
    console.log('📊 Final Results');
    console.log('====================================');
    console.log(`   Total URLs: ${results.total.toLocaleString()}`);
    console.log(`   ✅ Success: ${results.success.toLocaleString()}`);
    console.log(`   ❌ Failed: ${results.failed.toLocaleString()}`);
    console.log(`   Success Rate: ${((results.success / results.total) * 100).toFixed(2)}%`);

    if (results.errors.length > 0) {
        console.log('\n⚠️ Sample Errors (first 10):');
        results.errors.slice(0, 10).forEach(err => {
            console.log(`   - ${err.url}: ${err.error || `Status ${err.status}`}`);
        });
    }

    console.log('\n✨ Page warming complete!');
}

main().catch(console.error);
