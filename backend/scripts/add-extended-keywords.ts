/**
 * Add Extended SEO Keywords to Database
 * 
 * This script adds the new extended keywords (from frontend's seo-generation.ts)
 * to the backend database so they become part of the sitemap and SEO pages.
 * 
 * Run: npx ts-node scripts/add-extended-keywords.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extended keywords from frontend/src/lib/seo-generation.ts
// These are specific high-volume services not already in the database
const EXTENDED_KEYWORDS = [
    // Braiding Styles (High Volume)
    { keyword: 'Knotless Braids', slug: 'knotless-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Faux Locs', slug: 'faux-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Passion Twists', slug: 'passion-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Goddess Locs', slug: 'goddess-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Butterfly Locs', slug: 'butterfly-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Soft Locs', slug: 'soft-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Spring Twists', slug: 'spring-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Senegalese Twists', slug: 'senegalese-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Marley Twists', slug: 'marley-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Tribal Braids', slug: 'tribal-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Fulani Braids', slug: 'fulani-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Feed In Braids', slug: 'feed-in-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Stitch Braids', slug: 'stitch-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Jumbo Braids', slug: 'jumbo-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Micro Braids', slug: 'micro-braids', category: 'HAIR', priority: 1 },

    // Locs/Dreadlocks (High Demand)
    { keyword: 'Dreadlocks', slug: 'dreadlocks', category: 'HAIR', priority: 1 },
    { keyword: 'Locs', slug: 'locs', category: 'HAIR', priority: 1 },
    { keyword: 'Loc Retwist', slug: 'loc-retwist', category: 'HAIR', priority: 1 },
    { keyword: 'Starter Locs', slug: 'starter-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Loc Maintenance', slug: 'loc-maintenance', category: 'HAIR', priority: 1 },
    { keyword: 'Sisterlocks', slug: 'sisterlocks', category: 'HAIR', priority: 1 },
    { keyword: 'Interlocking Locs', slug: 'interlocking-locs', category: 'HAIR', priority: 1 },

    // Weaves & Installations
    { keyword: 'Sew In Weave', slug: 'sew-in-weave', category: 'HAIR', priority: 1 },
    { keyword: 'Quick Weave', slug: 'quick-weave', category: 'HAIR', priority: 1 },
    { keyword: 'Frontal Installation', slug: 'frontal-installation', category: 'HAIR', priority: 1 },
    { keyword: 'Closure Installation', slug: 'closure-installation', category: 'HAIR', priority: 1 },
    { keyword: 'Tape In Extensions', slug: 'tape-in-extensions', category: 'HAIR', priority: 1 },
    { keyword: 'Ponytail Installation', slug: 'ponytail-installation', category: 'HAIR', priority: 1 },

    // Nail Types
    { keyword: 'Dip Powder Nails', slug: 'dip-powder-nails', category: 'NAILS', priority: 1 },
    { keyword: 'SNS Nails', slug: 'sns-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Polygel Nails', slug: 'polygel-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Gel Extensions', slug: 'gel-extensions', category: 'NAILS', priority: 1 },
    { keyword: 'French Tips', slug: 'french-tips', category: 'NAILS', priority: 1 },
    { keyword: 'Coffin Nails', slug: 'coffin-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Stiletto Nails', slug: 'stiletto-nails', category: 'NAILS', priority: 1 },

    // Spa & Massage
    { keyword: 'Day Spa', slug: 'day-spa', category: 'SPA', priority: 1 },
    { keyword: 'Spa Packages', slug: 'spa-packages', category: 'SPA', priority: 1 },
    { keyword: 'Couples Massage', slug: 'couples-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Full Body Massage', slug: 'full-body-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Thai Massage', slug: 'thai-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Sports Massage', slug: 'sports-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Prenatal Massage', slug: 'prenatal-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Foot Massage', slug: 'foot-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Back Massage', slug: 'back-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Aromatherapy Massage', slug: 'aromatherapy-massage', category: 'MASSAGE', priority: 1 },

    // Facials
    { keyword: 'Hydrafacial', slug: 'hydrafacial', category: 'SPA', priority: 1 },
    { keyword: 'Deep Cleansing Facial', slug: 'deep-cleansing-facial', category: 'SPA', priority: 1 },
    { keyword: 'Anti Aging Facial', slug: 'anti-aging-facial', category: 'SPA', priority: 1 },
    { keyword: 'Acne Facial', slug: 'acne-facial', category: 'SPA', priority: 1 },
    { keyword: 'Microdermabrasion', slug: 'microdermabrasion', category: 'SPA', priority: 1 },

    // Barber
    { keyword: 'Fade Haircut', slug: 'fade-haircut', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Taper Fade', slug: 'taper-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Skin Fade', slug: 'skin-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Line Up', slug: 'line-up', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Shape Up', slug: 'shape-up', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Beard Grooming', slug: 'beard-grooming', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Boys Haircut', slug: 'boys-haircut', category: 'MENS_GROOMING', priority: 1 },

    // Lash & Brow
    { keyword: 'Classic Lashes', slug: 'classic-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Lash Fill', slug: 'lash-fill', category: 'LASHES', priority: 1 },
    { keyword: 'Lash Tint', slug: 'lash-tint', category: 'LASHES', priority: 1 },
    { keyword: 'Eyebrow Threading', slug: 'eyebrow-threading', category: 'BROWS', priority: 1 },
    { keyword: 'Eyebrow Waxing', slug: 'eyebrow-waxing', category: 'BROWS', priority: 1 },
    { keyword: 'Eyebrow Tinting', slug: 'eyebrow-tinting', category: 'BROWS', priority: 1 },
    { keyword: 'Ombre Brows', slug: 'ombre-brows', category: 'BROWS', priority: 1 },
    { keyword: 'Powder Brows', slug: 'powder-brows', category: 'BROWS', priority: 1 },

    // Aesthetics
    { keyword: 'Lip Fillers', slug: 'lip-fillers', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Cheek Fillers', slug: 'cheek-fillers', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Anti Wrinkle Injections', slug: 'anti-wrinkle-injections', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Fat Freezing', slug: 'fat-freezing', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Body Contouring', slug: 'body-contouring', category: 'AESTHETICS', priority: 1 },

    // Hair Treatments
    { keyword: 'Brazilian Blowout', slug: 'brazilian-blowout', category: 'HAIR', priority: 1 },
    { keyword: 'Hair Relaxer', slug: 'hair-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'Silk Press', slug: 'silk-press', category: 'HAIR', priority: 1 },
    { keyword: 'Dominican Blowout', slug: 'dominican-blowout', category: 'HAIR', priority: 1 },

    // Waxing
    { keyword: 'Bikini Wax', slug: 'bikini-wax', category: 'SPA', priority: 1 },
    { keyword: 'Hollywood Wax', slug: 'hollywood-wax', category: 'SPA', priority: 1 },
    { keyword: 'Leg Waxing', slug: 'leg-waxing', category: 'SPA', priority: 1 },
    { keyword: 'Full Body Wax', slug: 'full-body-wax', category: 'SPA', priority: 1 },
    { keyword: 'Mens Waxing', slug: 'mens-waxing', category: 'SPA', priority: 1 },

    // Additional High-Value
    { keyword: 'Afro Hair Salon', slug: 'afro-hair-salon', category: 'HAIR', priority: 1 },
    { keyword: 'Curly Hair Specialist', slug: 'curly-hair-specialist', category: 'HAIR', priority: 1 },
    { keyword: 'Black Owned Salon', slug: 'black-owned-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Walk In Salon', slug: 'walk-in-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Mobile Hairstylist', slug: 'mobile-hairstylist', category: 'HAIR', priority: 1 },
];

async function addExtendedKeywords() {
    console.log('🚀 Adding Extended SEO Keywords to Database...');
    console.log(`📝 Total keywords to add: ${EXTENDED_KEYWORDS.length}\n`);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const kw of EXTENDED_KEYWORDS) {
        try {
            // Check if keyword already exists
            const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM seo_keywords WHERE slug = ${kw.slug}
      `;

            if (existing.length > 0) {
                console.log(`⏭️  Skipped (exists): ${kw.keyword}`);
                skipped++;
                continue;
            }

            // Insert new keyword
            await prisma.$queryRaw`
        INSERT INTO seo_keywords (
          id, keyword, slug, category, priority, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), ${kw.keyword}, ${kw.slug}, ${kw.category}, 
          ${kw.priority}, NOW(), NOW()
        )
      `;

            console.log(`✅ Added: ${kw.keyword} (${kw.category})`);
            added++;
        } catch (error: any) {
            console.error(`❌ Error adding ${kw.keyword}:`, error.message);
            errors++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Added: ${added}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

    // Show total keyword count
    const totalCount = await prisma.seoKeyword.count();
    console.log(`\n📈 Total keywords in database: ${totalCount}`);

    // Calculate new page potential
    const locationCount = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM seo_locations`;
    const totalLocations = parseInt(locationCount[0].count);
    console.log(`📍 Total locations in database: ${totalLocations}`);
    console.log(`📄 Potential new pages: ${added * totalLocations}`);
    console.log(`📄 Total potential pages: ${totalCount * totalLocations}`);
}

addExtendedKeywords()
    .then(() => {
        console.log('\n✅ Extended keywords import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
