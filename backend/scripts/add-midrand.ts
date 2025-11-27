import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMidrand() {
  console.log('Adding Midrand to SEO locations...');
  
  try {
    // Check if Midrand already exists
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM seo_locations WHERE slug = 'midrand' AND province_slug = 'gauteng'
    `;
    
    if (existing.length > 0) {
      console.log('Midrand already exists!');
      return;
    }
    
    // Add Midrand as a city in Gauteng
    await prisma.$queryRaw`
      INSERT INTO seo_locations (
        id, name, slug, type, province, province_slug, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(), 'Midrand', 'midrand', 'CITY',
        'Gauteng', 'gauteng', NOW(), NOW()
      )
    `;
    
    console.log('✅ Midrand added successfully!');
    
    // Verify
    const verify = await prisma.$queryRaw<any[]>`
      SELECT * FROM seo_locations WHERE slug = 'midrand'
    `;
    console.log('Verification:', verify);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMidrand();
