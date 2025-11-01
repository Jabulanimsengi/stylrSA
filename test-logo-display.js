// Quick Logo Display Test Script
// Run this in your browser console while on the site

async function testLogoDisplay() {
  console.log('🔍 Testing Logo Display...\n');
  
  // Test 1: Check Featured Salons API
  console.log('1️⃣ Checking Featured Salons API...');
  try {
    const response = await fetch('https://stylrsa-production.up.railway.app/api/salons/featured', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('❌ API call failed:', response.status, response.statusText);
      return;
    }
    
    const salons = await response.json();
    console.log(`✅ Found ${salons.length} featured salons\n`);
    
    // Check each salon for logo
    const logoStats = {
      total: salons.length,
      withLogo: 0,
      withoutLogo: 0,
      logoUrls: []
    };
    
    salons.forEach(salon => {
      if (salon.logo) {
        logoStats.withLogo++;
        logoStats.logoUrls.push({
          salon: salon.name,
          logo: salon.logo
        });
      } else {
        logoStats.withoutLogo++;
      }
    });
    
    console.log('📊 Logo Statistics:');
    console.log(`   Total salons: ${logoStats.total}`);
    console.log(`   With logo: ${logoStats.withLogo}`);
    console.log(`   Without logo: ${logoStats.withoutLogo}\n`);
    
    if (logoStats.withLogo > 0) {
      console.log('✅ Salons WITH logos:');
      console.table(logoStats.logoUrls);
    } else {
      console.warn('⚠️  No salons have logo URLs in the API response');
    }
    
  } catch (error) {
    console.error('❌ Error fetching salons:', error);
  }
  
  // Test 2: Check if logo images are rendered in DOM
  console.log('\n2️⃣ Checking DOM for logo images...');
  const logoImages = document.querySelectorAll('.SalonCard_salonLogo__');
  const logoPlaceholders = document.querySelectorAll('.SalonCard_logoPlaceholder__');
  
  console.log(`   Logo images found: ${logoImages.length}`);
  console.log(`   Logo placeholders found: ${logoPlaceholders.length}`);
  
  if (logoImages.length > 0) {
    console.log('✅ Logo images are being rendered!');
    logoImages.forEach((img, index) => {
      console.log(`   Logo ${index + 1}:`, img.src);
    });
  } else if (logoPlaceholders.length > 0) {
    console.warn('⚠️  Only placeholders are showing (no actual logo images)');
  } else {
    console.warn('⚠️  No logo elements found in DOM');
  }
  
  // Test 3: Check local storage / cache
  console.log('\n3️⃣ Checking for cached data...');
  const cacheKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('salon')) {
      cacheKeys.push(key);
    }
  }
  
  if (cacheKeys.length > 0) {
    console.log('📦 Found salon-related cache:', cacheKeys);
  } else {
    console.log('✅ No salon cache found');
  }
  
  console.log('\n✅ Test complete!');
  console.log('\n💡 Next Steps:');
  console.log('1. If API has logo URLs but DOM doesn\'t → Frontend rendering issue');
  console.log('2. If API has no logo URLs → Backend or database issue');
  console.log('3. Check the database directly with the SQL query in LOGO_DISPLAY_DEBUG.md');
}

// Run the test
testLogoDisplay();
