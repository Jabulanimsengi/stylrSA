/**
 * Generate placeholder PWA icons
 * Run: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '../frontend/public');

// Create a simple SVG as placeholder
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">S</text>
</svg>`;
}

console.log('🎨 Generating placeholder PWA icons...\n');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  const svgPath = path.join(publicDir, svgFilename);
  
  // Create SVG file
  const svg = createSVGIcon(size);
  fs.writeFileSync(svgPath, svg);
  
  console.log(`✅ Created ${svgFilename}`);
});

console.log('\n✨ All placeholder icons created!');
console.log('\n📝 Note: These are temporary SVG placeholders.');
console.log('For production, use https://www.pwabuilder.com/imageGenerator');
console.log('to generate proper PNG icons from your logo.\n');
