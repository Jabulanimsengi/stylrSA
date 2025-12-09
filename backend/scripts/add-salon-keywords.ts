/**
 * Add Salon-Specific SEO Keywords
 * 
 * Keywords extracted from actual salon service listings
 * Includes South African-specific terms and trending styles
 * 
 * Run: npx ts-node scripts/add-salon-keywords.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SALON_KEYWORDS = [
    // === BRAIDING STYLES - Trending ===
    { keyword: 'French Curl Braids', slug: 'french-curl-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Boho Knotless Braids', slug: 'boho-knotless-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Boho Goddess Braids', slug: 'boho-goddess-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Coi Leray Braids', slug: 'coi-leray-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Heart Braids', slug: 'heart-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Zig Zag Braids', slug: 'zig-zag-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Pop Smoke Braids', slug: 'pop-smoke-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Alicia Keys Braids', slug: 'alicia-keys-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Lemonade Braids', slug: 'lemonade-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Cleopatra Braids', slug: 'cleopatra-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Makhosi Braids', slug: 'makhosi-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Shell Braids', slug: 'shell-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Popcorn Braids', slug: 'popcorn-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Triangle Braids', slug: 'triangle-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Knotted Braids', slug: 'knotted-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Normal Braids', slug: 'normal-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Pompom Braids', slug: 'pompom-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Gypsy Braids', slug: 'gypsy-braids', category: 'HAIR', priority: 1 },

    // === BUTTERFLY LOCS - Very Trending ===
    { keyword: 'Butterfly Braids', slug: 'butterfly-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Butterfly Twists', slug: 'butterfly-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Distressed Locs', slug: 'distressed-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Bongo Dreads', slug: 'bongo-dreads', category: 'HAIR', priority: 1 },
    { keyword: 'Marley Locks', slug: 'marley-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Invisible Locs', slug: 'invisible-locs', category: 'HAIR', priority: 1 },
    { keyword: 'Curly Faux Locs', slug: 'curly-faux-locs', category: 'HAIR', priority: 1 },

    // === CORNROWS - Variations ===
    { keyword: 'Stitch Cornrows', slug: 'stitch-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Sleek Cornrows', slug: 'sleek-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Freestyle Cornrows', slug: 'freestyle-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Beaded Cornrows', slug: 'beaded-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Straight Back Cornrows', slug: 'straight-back-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Freehand Cornrows', slug: 'freehand-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Wig Lines', slug: 'wig-lines', category: 'HAIR', priority: 1 },

    // === TWISTS ===
    { keyword: 'Yarn Twists', slug: 'yarn-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Micro Twists', slug: 'micro-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Invisible Twists', slug: 'invisible-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Natural Twists', slug: 'natural-twists', category: 'HAIR', priority: 1 },
    { keyword: 'Part Twists', slug: 'part-twists', category: 'HAIR', priority: 1 },

    // === PONYTAILS ===
    { keyword: 'Sleek Ponytail', slug: 'sleek-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Gypsy Ponytail', slug: 'gypsy-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Puff Ponytail', slug: 'puff-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Kinky Ponytail', slug: 'kinky-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Jozi Ponytail', slug: 'jozi-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Katy Perry Ponytail', slug: 'katy-perry-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Dolamo Ponytail', slug: 'dolamo-ponytail', category: 'HAIR', priority: 1 },
    { keyword: 'Croissant Ponytail', slug: 'croissant-ponytail', category: 'HAIR', priority: 1 },

    // === STRAIGHT UP - SA Specific ===
    { keyword: 'Straight Up', slug: 'straight-up', category: 'HAIR', priority: 1 },
    { keyword: 'Sleek Straight Up', slug: 'sleek-straight-up', category: 'HAIR', priority: 1 },

    // === RELAXERS & PERMS - SA Brands ===
    { keyword: 'Dark N Lovely Relaxer', slug: 'dark-n-lovely-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'Mizani Relaxer', slug: 'mizani-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'ORS Relaxer', slug: 'ors-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'S Curl', slug: 's-curl', category: 'HAIR', priority: 1 },
    { keyword: 'Revlon Relaxer', slug: 'revlon-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'Touch Up Relaxer', slug: 'touch-up-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'Naturalista', slug: 'naturalista', category: 'HAIR', priority: 1 },
    { keyword: 'Dry Perm', slug: 'dry-perm', category: 'HAIR', priority: 1 },

    // === WIGS & WEAVES ===
    { keyword: 'Wig Installation', slug: 'wig-installation', category: 'HAIR', priority: 1 },
    { keyword: 'Wig Making', slug: 'wig-making', category: 'HAIR', priority: 1 },
    { keyword: 'Wig Styling', slug: 'wig-styling', category: 'HAIR', priority: 1 },
    { keyword: 'Sew In', slug: 'sew-in', category: 'HAIR', priority: 1 },
    { keyword: 'Weave Installation', slug: 'weave-installation', category: 'HAIR', priority: 1 },
    { keyword: 'Closure Wig', slug: 'closure-wig', category: 'HAIR', priority: 1 },
    { keyword: 'Frontal Wig', slug: 'frontal-wig', category: 'HAIR', priority: 1 },
    { keyword: 'Leave Out Weave', slug: 'leave-out-weave', category: 'HAIR', priority: 1 },
    { keyword: 'Kinky Sew In', slug: 'kinky-sew-in', category: 'HAIR', priority: 1 },
    { keyword: 'Pixie Cut Extensions', slug: 'pixie-cut-extensions', category: 'HAIR', priority: 1 },

    // === NATURAL HAIR ===
    { keyword: 'Natural Dreadlocks', slug: 'natural-dreadlocs', category: 'HAIR', priority: 1 },
    { keyword: 'Loc Twist', slug: 'loc-twist', category: 'HAIR', priority: 1 },
    { keyword: 'Dreadlock Wash', slug: 'dreadlock-wash', category: 'HAIR', priority: 1 },
    { keyword: 'Jozi Dreads', slug: 'jozi-dreads', category: 'HAIR', priority: 1 },

    // === STYLING ===
    { keyword: 'Blow Wave', slug: 'blow-wave', category: 'HAIR', priority: 1 },
    { keyword: 'Wash And Blow Dry', slug: 'wash-and-blow-dry', category: 'HAIR', priority: 1 },
    { keyword: 'Flat Iron', slug: 'flat-iron', category: 'HAIR', priority: 1 },
    { keyword: 'Split Ends Trim', slug: 'split-ends-trim', category: 'HAIR', priority: 1 },
    { keyword: 'Dry Curl', slug: 'dry-curl', category: 'HAIR', priority: 1 },

    // === TREATMENTS - Brands ===
    { keyword: 'Olaplex', slug: 'olaplex', category: 'HAIR', priority: 1 },
    { keyword: 'Deep Conditioner Mask', slug: 'deep-conditioner-mask', category: 'HAIR', priority: 1 },
    { keyword: 'Intensive Repair Treatment', slug: 'intensive-repair-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Hair Loss Treatment', slug: 'hair-loss-treatment', category: 'HAIR', priority: 1 },

    // === COLOR ===
    { keyword: 'Closure Bleach', slug: 'closure-bleach', category: 'HAIR', priority: 1 },
    { keyword: 'Decolorizer', slug: 'decolorizer', category: 'HAIR', priority: 1 },
    { keyword: 'Weave Dye', slug: 'weave-dye', category: 'HAIR', priority: 1 },
    { keyword: 'Ombre Color', slug: 'ombre-color', category: 'HAIR', priority: 1 },

    // === KIDS HAIR ===
    { keyword: 'Kids Cornrows', slug: 'kids-cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Freehand', slug: 'kids-freehand', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Box Braids', slug: 'kids-box-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Relaxer', slug: 'kids-relaxer', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Pick And Drop', slug: 'kids-pick-and-drop', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Tribal Braids', slug: 'kids-tribal-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Wash And Dry', slug: 'kids-wash-and-dry', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Blow Wave', slug: 'kids-blow-wave', category: 'HAIR', priority: 1 },
    { keyword: 'Kiddies Hair', slug: 'kiddies-hair', category: 'HAIR', priority: 1 },

    // === MENS/BARBER - SA Specific ===
    { keyword: 'Chiskop', slug: 'chiskop', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Male Cornrows', slug: 'male-cornrows', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Waves', slug: 'waves', category: 'MENS_GROOMING', priority: 1 },

    // === EYEBROWS - More Specific ===
    { keyword: 'Combination Brows', slug: 'combination-brows', category: 'BROWS', priority: 1 },
    { keyword: 'Brow Tweeze', slug: 'brow-tweeze', category: 'BROWS', priority: 1 },
    { keyword: 'Microshading', slug: 'microshading', category: 'BROWS', priority: 1 },

    // === LASHES - More Specific ===
    { keyword: 'Cluster Lashes', slug: 'cluster-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Classic Cluster', slug: 'classic-cluster', category: 'LASHES', priority: 1 },
    { keyword: 'Semi Hybrid Lashes', slug: 'semi-hybrid-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Lash Refill', slug: 'lash-refill', category: 'LASHES', priority: 1 },

    // === NAILS - More Specific ===
    { keyword: 'Nail Tips', slug: 'nail-tips', category: 'NAILS', priority: 1 },
    { keyword: 'Nail Deco', slug: 'nail-deco', category: 'NAILS', priority: 1 },
    { keyword: 'Soak Off', slug: 'soak-off', category: 'NAILS', priority: 1 },
    { keyword: 'Plain Nails', slug: 'plain-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Acrylic Pedicure', slug: 'acrylic-pedicure', category: 'NAILS', priority: 1 },
    { keyword: 'Gel Pedicure', slug: 'gel-pedicure', category: 'NAILS', priority: 1 },

    // === ADDITIONAL SERVICES ===
    { keyword: 'Unbraiding', slug: 'unbraiding', category: 'HAIR', priority: 2 },
    { keyword: 'Hair Piece Mixing', slug: 'hair-piece-mixing', category: 'HAIR', priority: 2 },
    { keyword: 'Extra Parting', slug: 'extra-parting', category: 'HAIR', priority: 2 },
    { keyword: 'House Call', slug: 'house-call', category: 'GENERAL', priority: 1 },
    { keyword: 'Mobile Service', slug: 'mobile-service', category: 'GENERAL', priority: 1 },
    { keyword: 'Hair Beads', slug: 'hair-beads', category: 'HAIR', priority: 2 },

    // === FACIAL ===
    { keyword: 'Dermaplaning Facial', slug: 'dermaplaning-facial', category: 'SPA', priority: 1 },
    { keyword: 'Face And Neck Treatment', slug: 'face-and-neck-treatment', category: 'SPA', priority: 1 },
];

async function addSalonKeywords() {
    console.log('🚀 Adding Salon-Specific SEO Keywords to Database...');
    console.log(`📝 Total keywords to add: ${SALON_KEYWORDS.length}\n`);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const kw of SALON_KEYWORDS) {
        try {
            const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM seo_keywords WHERE slug = ${kw.slug}
      `;

            if (existing.length > 0) {
                console.log(`⏭️  Skipped (exists): ${kw.keyword}`);
                skipped++;
                continue;
            }

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

    const totalCount = await prisma.seoKeyword.count();
    console.log(`\n📈 Total keywords in database: ${totalCount}`);

    const locationCount = await prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM seo_locations`;
    const totalLocations = parseInt(locationCount[0].count);
    console.log(`📍 Total locations in database: ${totalLocations}`);
    console.log(`📄 Potential new pages: ${added * totalLocations}`);
    console.log(`📄 Total potential pages: ${totalCount * totalLocations}`);
}

addSalonKeywords()
    .then(() => {
        console.log('\n✅ Salon keywords import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
