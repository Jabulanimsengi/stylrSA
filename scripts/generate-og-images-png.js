/**
 * OG Image Generator - PNG Version
 * Generates Open Graph PNG images using Sharp
 * 
 * Usage: 
 *   npm install sharp
 *   node scripts/generate-og-images-png.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('❌ Sharp is not installed. Run: npm install sharp');
  console.log('   Or use the SVG version: node scripts/generate-og-images.js');
  process.exit(1);
}

// Service categories
const SERVICE_CATEGORIES = [
  { slug: 'braids', name: 'Braids & Locs', color: '#8B4513', emoji: '✨' },
  { slug: 'hair-salon', name: 'Hair Salon', color: '#D4A574', emoji: '💇' },
  { slug: 'nail-salon', name: 'Nail Salon', color: '#FF69B4', emoji: '💅' },
  { slug: 'makeup-artist', name: 'Makeup Artist', color: '#C71585', emoji: '💄' },
  { slug: 'barber', name: 'Barber Shop', color: '#2F4F4F', emoji: '💈' },
  { slug: 'spa', name: 'Spa & Wellness', color: '#20B2AA', emoji: '🧖' },
  { slug: 'massage', name: 'Massage Therapy', color: '#9370DB', emoji: '💆' },
  { slug: 'skincare', name: 'Skincare', color: '#FFB6C1', emoji: '✨' },
  { slug: 'lash-extensions', name: 'Lash Extensions', color: '#4B0082', emoji: '👁️' },
  { slug: 'brow-artist', name: 'Brow Artist', color: '#8B4513', emoji: '✨' },
  { slug: 'waxing', name: 'Waxing Services', color: '#DEB887', emoji: '✨' },
  { slug: 'hair-extensions', name: 'Hair Extensions', color: '#CD853F', emoji: '💇' },
  { slug: 'hair-color', name: 'Hair Coloring', color: '#FF6347', emoji: '🎨' },
  { slug: 'natural-hair', name: 'Natural Hair', color: '#228B22', emoji: '🌿' },
  { slug: 'keratin-treatment', name: 'Keratin Treatment', color: '#DAA520', emoji: '✨' },
  { slug: 'facial', name: 'Facial Treatment', color: '#87CEEB', emoji: '🧴' },
  { slug: 'pedicure', name: 'Pedicure', color: '#FF1493', emoji: '🦶' },
  { slug: 'manicure', name: 'Manicure', color: '#FF69B4', emoji: '💅' },
  { slug: 'wedding-makeup', name: 'Wedding Makeup', color: '#FFD700', emoji: '👰' },
  { slug: 'mens-grooming', name: "Men's Grooming", color: '#2F4F4F', emoji: '🧔' },
];

const BRAND = {
  primary: '#f51957',
  background: '#1a1a2e',
  backgroundEnd: '#16213e',
};

/**
 * Generate SVG for Sharp to convert to PNG
 */
function createSVG(name, color) {
  return Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND.background}"/>
          <stop offset="100%" style="stop-color:${BRAND.backgroundEnd}"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${BRAND.primary}"/>
          <stop offset="100%" style="stop-color:${color}"/>
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="1050" cy="120" r="180" fill="${color}" opacity="0.15"/>
      <circle cx="150" cy="510" r="140" fill="${BRAND.primary}" opacity="0.15"/>
      <rect x="0" y="0" width="10" height="630" fill="url(#accent)"/>
      
      <text x="70" y="85" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="bold" fill="${BRAND.primary}">
        Stylr SA
      </text>
      
      <text x="600" y="320" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">
        ${escapeXml(name)}
      </text>
      
      <text x="600" y="400" font-family="Arial, Helvetica, sans-serif" font-size="28" text-anchor="middle" fill="#aaaaaa">
        Find &amp; Book Top-Rated Professionals Near You
      </text>
      
      <rect x="425" y="450" width="350" height="65" rx="32" fill="url(#accent)"/>
      <text x="600" y="493" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" text-anchor="middle" fill="white">
        Book Online Now
      </text>
      
      <rect x="0" y="610" width="1200" height="20" fill="url(#accent)"/>
      <text x="1130" y="590" font-family="Arial, Helvetica, sans-serif" font-size="18" text-anchor="end" fill="#666666">
        stylrsa.co.za
      </text>
    </svg>
  `);
}

/**
 * Generate default OG image SVG
 */
function createDefaultSVG() {
  return Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND.background}"/>
          <stop offset="100%" style="stop-color:${BRAND.backgroundEnd}"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${BRAND.primary}"/>
          <stop offset="100%" style="stop-color:#8B4513"/>
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      <circle cx="1000" cy="150" r="220" fill="${BRAND.primary}" opacity="0.1"/>
      <circle cx="200" cy="480" r="180" fill="#8B4513" opacity="0.1"/>
      <rect x="0" y="0" width="10" height="630" fill="url(#accent)"/>
      
      <text x="600" y="220" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="${BRAND.primary}">
        Stylr SA
      </text>
      
      <text x="600" y="310" font-family="Arial, Helvetica, sans-serif" font-size="36" text-anchor="middle" fill="white">
        South Africa's Beauty Booking Platform
      </text>
      
      <text x="600" y="400" font-family="Arial, Helvetica, sans-serif" font-size="22" text-anchor="middle" fill="#888888">
        Hair Salons • Nail Techs • Makeup Artists • Spas • Barbers
      </text>
      
      <rect x="375" y="450" width="450" height="70" rx="35" fill="url(#accent)"/>
      <text x="600" y="497" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" text-anchor="middle" fill="white">
        Book Your Appointment
      </text>
      
      <rect x="0" y="610" width="1200" height="20" fill="url(#accent)"/>
      <text x="1130" y="590" font-family="Arial, Helvetica, sans-serif" font-size="18" text-anchor="end" fill="#666666">
        stylrsa.co.za
      </text>
    </svg>
  `);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateImages() {
  const outputDir = path.join(__dirname, '../frontend/public/og-images');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('\n📸 Generating OG images (PNG)...\n');
  
  // Generate category images
  for (const cat of SERVICE_CATEGORIES) {
    const svg = createSVG(cat.name, cat.color);
    const outputPath = path.join(outputDir, `${cat.slug}.jpg`);
    
    await sharp(svg)
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`  ✅ ${cat.name} → ${cat.slug}.jpg`);
  }
  
  // Generate default image
  const defaultSvg = createDefaultSVG();
  await sharp(defaultSvg)
    .jpeg({ quality: 90 })
    .toFile(path.join(outputDir, 'og-default.jpg'));
  
  console.log(`  ✅ Default → og-default.jpg`);
  
  console.log(`\n🎉 Generated ${SERVICE_CATEGORIES.length + 1} OG images!`);
  console.log(`📁 Output: ${outputDir}\n`);
}

generateImages().catch(console.error);
