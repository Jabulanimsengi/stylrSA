/**
 * Migration script to generate slugs for existing salons
 * Run with: node scripts/generate-salon-slugs.js
 * 
 * Prerequisites:
 * 1. Run prisma migrate to add the slug field first
 * 2. Set DATABASE_URL environment variable
 */

// Use Prisma client from backend
const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

/**
 * Generate a URL-friendly slug from text
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')          // Trim hyphens from start
    .replace(/-+$/, '');         // Trim hyphens from end
}

/**
 * Generate a salon slug from name and city
 */
function generateSalonSlug(name, city) {
  const nameSlug = slugify(name);
  const citySlug = slugify(city || '');
  return citySlug ? `${nameSlug}-${citySlug}` : nameSlug;
}

async function main() {
  console.log('Starting slug generation for existing salons...\n');

  // Get all salons without slugs
  const salons = await prisma.salon.findMany({
    where: {
      slug: null,
    },
    select: {
      id: true,
      name: true,
      city: true,
    },
  });

  console.log(`Found ${salons.length} salons without slugs\n`);

  if (salons.length === 0) {
    console.log('All salons already have slugs. Nothing to do.');
    return;
  }

  // Track used slugs to handle duplicates
  const usedSlugs = new Set();

  // Get existing slugs
  const existingSlugs = await prisma.salon.findMany({
    where: {
      slug: { not: null },
    },
    select: { slug: true },
  });
  existingSlugs.forEach(s => usedSlugs.add(s.slug));

  let updated = 0;
  let errors = 0;

  for (const salon of salons) {
    try {
      let baseSlug = generateSalonSlug(salon.name, salon.city);
      let slug = baseSlug;
      let counter = 2;

      // Handle duplicates by appending numbers
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update the salon with the new slug
      await prisma.salon.update({
        where: { id: salon.id },
        data: { slug },
      });

      usedSlugs.add(slug);
      updated++;
      console.log(`✓ ${salon.name} -> ${slug}`);
    } catch (error) {
      errors++;
      console.error(`✗ Failed to update ${salon.name}: ${error.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Migration complete!`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`========================================\n`);
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
