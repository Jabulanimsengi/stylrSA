/**
 * OG Image Generator Script
 * Generates Open Graph images for SEO pages
 * 
 * Usage: node scripts/generate-og-images.js
 * 
 * Requirements:
 * - npm install canvas (for image generation)
 * - Or use sharp for simpler approach
 * 
 * This script creates branded OG images (1200x630) for each service category
 */

const fs = require('fs');
const path = require('path');

// Service categories with their display names and colors
const SERVICE_CATEGORIES = [
  { slug: 'braids', name: 'Braids & Locs', color: '#8B4513', icon: '✨' },
  { slug: 'hair-salon', name: 'Hair Salon', color: '#D4A574', icon: '💇' },
  { slug: 'nail-salon', name: 'Nail Salon', color: '#FF69B4', icon: '💅' },
  { slug: 'makeup-artist', name: 'Makeup Artist', color: '#C71585', icon: '💄' },
  { slug: 'barber', name: 'Barber Shop', color: '#2F4F4F', icon: '💈' },
  { slug: 'spa', name: 'Spa & Wellness', color: '#20B2AA', icon: '🧖' },
  { slug: 'massage', name: 'Massage Therapy', color: '#9370DB', icon: '💆' },
  { slug: 'skincare', name: 'Skincare', color: '#FFB6C1', icon: '✨' },
  { slug: 'lash-extensions', name: 'Lash Extensions', color: '#4B0082', icon: '👁️' },
  { slug: 'brow-artist', name: 'Brow Artist', color: '#8B4513', icon: '✨' },
  { slug: 'waxing', name: 'Waxing Services', color: '#DEB887', icon: '✨' },
  { slug: 'hair-extensions', name: 'Hair Extensions', color: '#CD853F', icon: '💇' },
  { slug: 'hair-color', name: 'Hair Coloring', color: '#FF6347', icon: '🎨' },
  { slug: 'natural-hair', name: 'Natural Hair', color: '#228B22', icon: '🌿' },
  { slug: 'keratin-treatment', name: 'Keratin Treatment', color: '#DAA520', icon: '✨' },
  { slug: 'facial', name: 'Facial Treatment', color: '#87CEEB', icon: '🧴' },
  { slug: 'pedicure', name: 'Pedicure', color: '#FF1493', icon: '🦶' },
  { slug: 'manicure', name: 'Manicure', color: '#FF69B4', icon: '💅' },
  { slug: 'wedding-makeup', name: 'Wedding Makeup', color: '#FFD700', icon: '👰' },
  { slug: 'mens-grooming', name: "Men's Grooming", color: '#2F4F4F', icon: '🧔' },
];

// Brand colors
const BRAND = {
  primary: '#f51957',
  secondary: '#8B4513',
  background: '#1a1a2e',
  text: '#ffffff',
  accent: '#FFD700',
};

/**
 * Generate SVG-based OG image (can be converted to PNG later)
 * This approach doesn't require canvas installation
 */
function generateSVG(category) {
  const { name, color, icon } = category;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="1100" cy="100" r="200" fill="${color}" opacity="0.1"/>
  <circle cx="100" cy="530" r="150" fill="${BRAND.primary}" opacity="0.1"/>
  
  <!-- Accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="url(#accent)"/>
  
  <!-- Logo area -->
  <text x="60" y="80" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${BRAND.primary}">
    Stylr SA
  </text>
  
  <!-- Main icon -->
  <text x="600" y="250" font-family="Arial, sans-serif" font-size="120" text-anchor="middle" fill="${color}">
    ${icon}
  </text>
  
  <!-- Service name -->
  <text x="600" y="380" font-family="Arial, sans-serif" font-size="64" font-weight="bold" text-anchor="middle" fill="${BRAND.text}">
    ${name}
  </text>
  
  <!-- Tagline -->
  <text x="600" y="450" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#aaaaaa">
    Find &amp; Book Top-Rated Professionals Near You
  </text>
  
  <!-- CTA -->
  <rect x="450" y="490" width="300" height="60" rx="30" fill="url(#accent)"/>
  <text x="600" y="530" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="${BRAND.text}">
    Book Online Now
  </text>
  
  <!-- Bottom bar -->
  <rect x="0" y="610" width="1200" height="20" fill="url(#accent)"/>
  
  <!-- Website -->
  <text x="1140" y="590" font-family="Arial, sans-serif" font-size="20" text-anchor="end" fill="#888888">
    stylrsa.co.za
  </text>
</svg>`;
}

/**
 * Generate default OG image
 */
function generateDefaultSVG() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${BRAND.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${BRAND.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${BRAND.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Decorative elements -->
  <circle cx="1050" cy="150" r="250" fill="${BRAND.primary}" opacity="0.08"/>
  <circle cx="150" cy="480" r="200" fill="${BRAND.secondary}" opacity="0.08"/>
  
  <!-- Accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="url(#accent)"/>
  
  <!-- Logo -->
  <text x="600" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="${BRAND.primary}">
    Stylr SA
  </text>
  
  <!-- Tagline -->
  <text x="600" y="300" font-family="Arial, sans-serif" font-size="36" text-anchor="middle" fill="${BRAND.text}">
    South Africa's Beauty Booking Platform
  </text>
  
  <!-- Features -->
  <text x="600" y="400" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#aaaaaa">
    ✓ Hair Salons  ✓ Nail Techs  ✓ Makeup Artists  ✓ Spas  ✓ Barbers
  </text>
  
  <!-- CTA -->
  <rect x="400" y="460" width="400" height="70" rx="35" fill="url(#accent)"/>
  <text x="600" y="505" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="${BRAND.text}">
    Book Your Appointment
  </text>
  
  <!-- Bottom bar -->
  <rect x="0" y="610" width="1200" height="20" fill="url(#accent)"/>
  
  <!-- Website -->
  <text x="1140" y="590" font-family="Arial, sans-serif" font-size="20" text-anchor="end" fill="#888888">
    stylrsa.co.za
  </text>
</svg>`;
}

/**
 * Main function to generate all OG images
 */
async function generateAllImages() {
  const outputDir = path.join(__dirname, '../frontend/public/og-images');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Created directory: ${outputDir}`);
  }
  
  // Generate category images
  console.log('\n📸 Generating OG images for service categories...\n');
  
  for (const category of SERVICE_CATEGORIES) {
    const svg = generateSVG(category);
    const filePath = path.join(outputDir, `${category.slug}.svg`);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✅ ${category.name} → ${category.slug}.svg`);
  }
  
  // Generate default image
  const defaultSvg = generateDefaultSVG();
  const defaultPath = path.join(outputDir, 'og-default.svg');
  fs.writeFileSync(defaultPath, defaultSvg);
  console.log(`  ✅ Default → og-default.svg`);
  
  console.log(`\n🎉 Generated ${SERVICE_CATEGORIES.length + 1} OG images!`);
  console.log(`\n📁 Output directory: ${outputDir}`);
  
  console.log('\n📝 Next steps:');
  console.log('   1. Convert SVGs to PNG/JPG using a tool like:');
  console.log('      - Inkscape: inkscape -w 1200 -h 630 input.svg -o output.png');
  console.log('      - ImageMagick: convert input.svg output.png');
  console.log('      - Online: svgtopng.com');
  console.log('   2. Or use the SVGs directly (most browsers support them)');
  console.log('   3. Update schema to use .svg extension if keeping SVGs');
}

// Run the script
generateAllImages().catch(console.error);
