/**
 * SEO Page Warmer Script
 * Visits all keyword+location combinations to trigger on-demand page generation
 * 
 * Usage: node scripts/warm-seo-pages.js [--production]
 * 
 * Options:
 *   --production  Use production URL (https://stylrsa.onrender.com)
 *   Default uses localhost:3002
 */

const BASE_URL = process.argv.includes('--production')
  ? 'https://stylrsa.onrender.com'
  : 'http://localhost:3002';

const CONCURRENCY = 3; // Number of parallel requests (be gentle on the server)
const DELAY_BETWEEN_BATCHES = 1000; // ms delay between batches

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function warmPage(url) {
  const fullUrl = `${BASE_URL}/seo-pages/by-url?url=${encodeURIComponent(url)}`;
  try {
    const start = Date.now();
    const response = await fetch(fullUrl);
    const elapsed = Date.now() - start;
    
    if (response.ok) {
      return { url, status: 'success', time: elapsed };
    } else {
      const text = await response.text();
      return { url, status: 'error', error: `${response.status}: ${text.slice(0, 100)}`, time: elapsed };
    }
  } catch (error) {
    return { url, status: 'error', error: error.message };
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processBatch(urls, batchNum, totalBatches) {
  const results = await Promise.all(urls.map(warmPage));
  
  const success = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error');
  
  console.log(`Batch ${batchNum}/${totalBatches}: ${success}/${urls.length} success`);
  
  if (errors.length > 0) {
    errors.forEach(e => console.log(`  ❌ ${e.url}: ${e.error}`));
  }
  
  return results;
}

async function main() {
  console.log(`\n🔥 SEO Page Warmer`);
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`⚡ Concurrency: ${CONCURRENCY}\n`);

  // Fetch keywords
  console.log('📚 Fetching keywords...');
  const keywords = await fetchJson(`${BASE_URL}/seo-pages/keywords/top?limit=200`);
  console.log(`   Found ${keywords.length} keywords`);

  // Fetch provinces
  console.log('🗺️  Fetching provinces...');
  const provinces = await fetchJson(`${BASE_URL}/seo-pages/locations/provinces`);
  console.log(`   Found ${provinces.length} provinces`);

  // Fetch top cities
  console.log('🏙️  Fetching cities...');
  const cities = await fetchJson(`${BASE_URL}/seo-pages/locations/cities/top?limit=200`);
  console.log(`   Found ${cities.length} cities`);

  // Build all URL combinations
  const urls = [];

  // Province-level pages (keyword + province)
  for (const keyword of keywords) {
    for (const province of provinces) {
      urls.push(`/${keyword.slug}/${province.provinceSlug}`);
    }
  }

  // City-level pages (keyword + province + city)
  for (const keyword of keywords) {
    for (const city of cities) {
      urls.push(`/${keyword.slug}/${city.provinceSlug}/${city.slug}`);
    }
  }

  console.log(`\n📄 Total pages to warm: ${urls.length}`);
  console.log(`   (${keywords.length} keywords × ${provinces.length} provinces) + (${keywords.length} keywords × ${cities.length} cities)\n`);

  // Process in batches
  const batches = [];
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    batches.push(urls.slice(i, i + CONCURRENCY));
  }

  let totalSuccess = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  for (let i = 0; i < batches.length; i++) {
    const results = await processBatch(batches[i], i + 1, batches.length);
    totalSuccess += results.filter(r => r.status === 'success').length;
    totalErrors += results.filter(r => r.status === 'error').length;
    
    if (i < batches.length - 1) {
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n✅ Complete!`);
  console.log(`   Success: ${totalSuccess}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Time: ${elapsed}s`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
