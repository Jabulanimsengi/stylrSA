/**
 * Add MORE Extended SEO Keywords to Database - COMPREHENSIVE
 * 
 * This script adds 200+ additional high-ranking beauty industry keywords
 * that weren't in the first batch.
 * 
 * Run: npx ts-node scripts/add-more-keywords.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MORE_KEYWORDS = [
    // === HAIR - Additional Styles ===
    { keyword: 'Box Braids', slug: 'box-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Crochet Braids', slug: 'crochet-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Cornrows', slug: 'cornrows', category: 'HAIR', priority: 1 },
    { keyword: 'Ghana Braids', slug: 'ghana-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Lemonade Braids', slug: 'lemonade-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Bohemian Braids', slug: 'bohemian-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Boho Braids', slug: 'boho-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Twist Outs', slug: 'twist-outs', category: 'HAIR', priority: 1 },
    { keyword: 'Bantu Knots', slug: 'bantu-knots', category: 'HAIR', priority: 1 },
    { keyword: 'Finger Waves', slug: 'finger-waves', category: 'HAIR', priority: 1 },
    { keyword: 'Pin Curls', slug: 'pin-curls', category: 'HAIR', priority: 1 },
    { keyword: 'Flexi Rod Set', slug: 'flexi-rod-set', category: 'HAIR', priority: 1 },
    { keyword: 'Roller Set', slug: 'roller-set', category: 'HAIR', priority: 1 },
    { keyword: 'Wash And Go', slug: 'wash-and-go', category: 'HAIR', priority: 1 },
    { keyword: 'Natural Hair Salon', slug: 'natural-hair-salon', category: 'HAIR', priority: 1 },
    { keyword: 'Curly Hair Salon', slug: 'curly-hair-salon', category: 'HAIR', priority: 1 },
    { keyword: 'Textured Hair Salon', slug: 'textured-hair-salon', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Braids', slug: 'kids-braids', category: 'HAIR', priority: 1 },
    { keyword: 'Kids Hairstyles', slug: 'kids-hairstyles', category: 'HAIR', priority: 1 },
    { keyword: 'Toddler Haircut', slug: 'toddler-haircut', category: 'HAIR', priority: 1 },

    // === HAIR - Color ===
    { keyword: 'Balayage', slug: 'balayage', category: 'HAIR', priority: 1 },
    { keyword: 'Ombre Hair', slug: 'ombre-hair', category: 'HAIR', priority: 1 },
    { keyword: 'Hair Highlights', slug: 'hair-highlights', category: 'HAIR', priority: 1 },
    { keyword: 'Lowlights', slug: 'lowlights', category: 'HAIR', priority: 1 },
    { keyword: 'Root Touch Up', slug: 'root-touch-up', category: 'HAIR', priority: 1 },
    { keyword: 'Blonde Hair Color', slug: 'blonde-hair-color', category: 'HAIR', priority: 1 },
    { keyword: 'Red Hair Color', slug: 'red-hair-color', category: 'HAIR', priority: 1 },
    { keyword: 'Burgundy Hair Color', slug: 'burgundy-hair-color', category: 'HAIR', priority: 1 },
    { keyword: 'Fashion Colors', slug: 'fashion-colors', category: 'HAIR', priority: 1 },
    { keyword: 'Color Correction', slug: 'color-correction', category: 'HAIR', priority: 1 },
    { keyword: 'Toner', slug: 'toner', category: 'HAIR', priority: 1 },
    { keyword: 'Glossing Treatment', slug: 'glossing-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Grey Coverage', slug: 'grey-coverage', category: 'HAIR', priority: 1 },

    // === HAIR - Treatments ===
    { keyword: 'Keratin Treatment', slug: 'keratin-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Protein Treatment', slug: 'protein-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Deep Conditioning', slug: 'deep-conditioning', category: 'HAIR', priority: 1 },
    { keyword: 'Hot Oil Treatment', slug: 'hot-oil-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Scalp Treatment', slug: 'scalp-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Hair Botox', slug: 'hair-botox', category: 'HAIR', priority: 1 },
    { keyword: 'Olaplex Treatment', slug: 'olaplex-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Bond Repair Treatment', slug: 'bond-repair-treatment', category: 'HAIR', priority: 1 },
    { keyword: 'Hair Spa', slug: 'hair-spa', category: 'HAIR', priority: 1 },
    { keyword: 'Hair Steaming', slug: 'hair-steaming', category: 'HAIR', priority: 1 },
    { keyword: 'Moisture Treatment', slug: 'moisture-treatment', category: 'HAIR', priority: 1 },

    // === HAIR - Cuts & Styles ===
    { keyword: 'Pixie Cut', slug: 'pixie-cut', category: 'HAIR', priority: 1 },
    { keyword: 'Bob Haircut', slug: 'bob-haircut', category: 'HAIR', priority: 1 },
    { keyword: 'Layered Haircut', slug: 'layered-haircut', category: 'HAIR', priority: 1 },
    { keyword: 'Trim', slug: 'trim', category: 'HAIR', priority: 1 },
    { keyword: 'Blowout', slug: 'blowout', category: 'HAIR', priority: 1 },
    { keyword: 'Blow Dry', slug: 'blow-dry', category: 'HAIR', priority: 1 },
    { keyword: 'Wash And Set', slug: 'wash-and-set', category: 'HAIR', priority: 1 },
    { keyword: 'Updo', slug: 'updo', category: 'HAIR', priority: 1 },
    { keyword: 'Bridal Hair', slug: 'bridal-hair', category: 'HAIR', priority: 1 },
    { keyword: 'Wedding Hair', slug: 'wedding-hair', category: 'HAIR', priority: 1 },
    { keyword: 'Prom Hair', slug: 'prom-hair', category: 'HAIR', priority: 1 },
    { keyword: 'Formal Hair', slug: 'formal-hair', category: 'HAIR', priority: 1 },
    { keyword: 'Matric Dance Hair', slug: 'matric-dance-hair', category: 'HAIR', priority: 1 },

    // === NAILS - Additional ===
    { keyword: 'Acrylic Nails', slug: 'acrylic-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Gel Nails', slug: 'gel-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Shellac Nails', slug: 'shellac-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Builder Gel', slug: 'builder-gel', category: 'NAILS', priority: 1 },
    { keyword: 'BIAB Nails', slug: 'biab-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Nail Art', slug: 'nail-art', category: 'NAILS', priority: 1 },
    { keyword: 'Chrome Nails', slug: 'chrome-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Ombre Nails', slug: 'ombre-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Almond Nails', slug: 'almond-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Square Nails', slug: 'square-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Ballerina Nails', slug: 'ballerina-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Short Nails', slug: 'short-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Long Nails', slug: 'long-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Nail Removal', slug: 'nail-removal', category: 'NAILS', priority: 1 },
    { keyword: 'Soak Off Nails', slug: 'soak-off-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Nail Repair', slug: 'nail-repair', category: 'NAILS', priority: 1 },
    { keyword: 'Nail Fill', slug: 'nail-fill', category: 'NAILS', priority: 1 },
    { keyword: 'Infill', slug: 'infill', category: 'NAILS', priority: 1 },
    { keyword: 'Express Manicure', slug: 'express-manicure', category: 'NAILS', priority: 1 },
    { keyword: 'Express Pedicure', slug: 'express-pedicure', category: 'NAILS', priority: 1 },
    { keyword: 'Paraffin Wax Treatment', slug: 'paraffin-wax-treatment', category: 'NAILS', priority: 1 },
    { keyword: 'Callus Removal', slug: 'callus-removal', category: 'NAILS', priority: 1 },
    { keyword: 'Bridal Nails', slug: 'bridal-nails', category: 'NAILS', priority: 1 },
    { keyword: 'Press On Nails', slug: 'press-on-nails', category: 'NAILS', priority: 1 },

    // === LASHES - Additional ===
    { keyword: 'Volume Lashes', slug: 'volume-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Mega Volume Lashes', slug: 'mega-volume-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Hybrid Lashes', slug: 'hybrid-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Russian Lashes', slug: 'russian-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Cat Eye Lashes', slug: 'cat-eye-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Doll Eye Lashes', slug: 'doll-eye-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Wispy Lashes', slug: 'wispy-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Natural Lashes', slug: 'natural-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Lash Removal', slug: 'lash-removal', category: 'LASHES', priority: 1 },
    { keyword: 'Lash Lift', slug: 'lash-lift', category: 'LASHES', priority: 1 },
    { keyword: 'Lash Perm', slug: 'lash-perm', category: 'LASHES', priority: 1 },
    { keyword: 'Strip Lashes', slug: 'strip-lashes', category: 'LASHES', priority: 1 },
    { keyword: 'Bridal Lashes', slug: 'bridal-lashes', category: 'LASHES', priority: 1 },

    // === BROWS - Additional ===
    { keyword: 'Microblading', slug: 'microblading', category: 'BROWS', priority: 1 },
    { keyword: 'Nanoblading', slug: 'nanoblading', category: 'BROWS', priority: 1 },
    { keyword: 'Brow Lamination', slug: 'brow-lamination', category: 'BROWS', priority: 1 },
    { keyword: 'Brow Shaping', slug: 'brow-shaping', category: 'BROWS', priority: 1 },
    { keyword: 'Brow Mapping', slug: 'brow-mapping', category: 'BROWS', priority: 1 },
    { keyword: 'Henna Brows', slug: 'henna-brows', category: 'BROWS', priority: 1 },
    { keyword: 'Eyebrow Tattoo', slug: 'eyebrow-tattoo', category: 'BROWS', priority: 1 },
    { keyword: 'Combo Brows', slug: 'combo-brows', category: 'BROWS', priority: 1 },

    // === MAKEUP ===
    { keyword: 'Bridal Makeup', slug: 'bridal-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Wedding Makeup', slug: 'wedding-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Glam Makeup', slug: 'glam-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Natural Makeup Look', slug: 'natural-makeup-look', category: 'MAKEUP', priority: 1 },
    { keyword: 'Soft Glam', slug: 'soft-glam', category: 'MAKEUP', priority: 1 },
    { keyword: 'Cut Crease', slug: 'cut-crease', category: 'MAKEUP', priority: 1 },
    { keyword: 'Prom Makeup', slug: 'prom-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Matric Dance Makeup', slug: 'matric-dance-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Party Makeup', slug: 'party-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Special Occasion Makeup', slug: 'special-occasion-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Editorial Makeup', slug: 'editorial-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Photoshoot Makeup', slug: 'photoshoot-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Airbrush Makeup', slug: 'airbrush-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'HD Makeup', slug: 'hd-makeup', category: 'MAKEUP', priority: 1 },
    { keyword: 'Makeup Lesson', slug: 'makeup-lesson', category: 'MAKEUP', priority: 1 },
    { keyword: 'Makeup Artist', slug: 'makeup-artist', category: 'MAKEUP', priority: 1 },
    { keyword: 'Mobile Makeup Artist', slug: 'mobile-makeup-artist', category: 'MAKEUP', priority: 1 },

    // === BARBER - Additional ===
    { keyword: 'Drop Fade', slug: 'drop-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Mid Fade', slug: 'mid-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'High Fade', slug: 'high-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Low Fade', slug: 'low-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Buzz Cut', slug: 'buzz-cut', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Crew Cut', slug: 'crew-cut', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Afro Haircut', slug: 'afro-haircut', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Waves Haircut', slug: 'waves-haircut', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Mohawk', slug: 'mohawk', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Bald Fade', slug: 'bald-fade', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Beard Trim', slug: 'beard-trim', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Beard Shaping', slug: 'beard-shaping', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Hot Towel Shave', slug: 'hot-towel-shave', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Straight Razor Shave', slug: 'straight-razor-shave', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Beard Dye', slug: 'beard-dye', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Hair Design', slug: 'hair-design', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Hair Tattoo', slug: 'hair-tattoo', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Mobile Barber', slug: 'mobile-barber', category: 'MENS_GROOMING', priority: 1 },
    { keyword: 'Kids Barber', slug: 'kids-barber', category: 'MENS_GROOMING', priority: 1 },

    // === SPA & MASSAGE - Additional ===
    { keyword: 'Swedish Massage', slug: 'swedish-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Deep Tissue Massage', slug: 'deep-tissue-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Hot Stone Massage', slug: 'hot-stone-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Relaxation Massage', slug: 'relaxation-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Head Massage', slug: 'head-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Neck And Shoulder Massage', slug: 'neck-and-shoulder-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Lymphatic Drainage Massage', slug: 'lymphatic-drainage-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Reflexology', slug: 'reflexology', category: 'MASSAGE', priority: 1 },
    { keyword: 'Cupping Therapy', slug: 'cupping-therapy', category: 'MASSAGE', priority: 1 },
    { keyword: 'Bamboo Massage', slug: 'bamboo-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Indian Head Massage', slug: 'indian-head-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Pregnancy Massage', slug: 'pregnancy-massage', category: 'MASSAGE', priority: 1 },
    { keyword: 'Remedial Massage', slug: 'remedial-massage', category: 'MASSAGE', priority: 1 },

    // === FACIALS & SKIN - Additional ===
    { keyword: 'Chemical Peel', slug: 'chemical-peel', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Dermaplaning', slug: 'dermaplaning', category: 'SPA', priority: 1 },
    { keyword: 'Microneedling', slug: 'microneedling', category: 'AESTHETICS', priority: 1 },
    { keyword: 'LED Light Therapy', slug: 'led-light-therapy', category: 'SPA', priority: 1 },
    { keyword: 'Oxygen Facial', slug: 'oxygen-facial', category: 'SPA', priority: 1 },
    { keyword: 'Vitamin C Facial', slug: 'vitamin-c-facial', category: 'SPA', priority: 1 },
    { keyword: 'Enzyme Facial', slug: 'enzyme-facial', category: 'SPA', priority: 1 },
    { keyword: 'Brightening Facial', slug: 'brightening-facial', category: 'SPA', priority: 1 },
    { keyword: 'Teen Facial', slug: 'teen-facial', category: 'SPA', priority: 1 },
    { keyword: 'Mens Facial', slug: 'mens-facial', category: 'SPA', priority: 1 },
    { keyword: 'Express Facial', slug: 'express-facial', category: 'SPA', priority: 1 },
    { keyword: 'Deluxe Facial', slug: 'deluxe-facial', category: 'SPA', priority: 1 },
    { keyword: 'Signature Facial', slug: 'signature-facial', category: 'SPA', priority: 1 },
    { keyword: 'Back Facial', slug: 'back-facial', category: 'SPA', priority: 1 },
    { keyword: 'Blackhead Removal', slug: 'blackhead-removal', category: 'SPA', priority: 1 },
    { keyword: 'Pore Extraction', slug: 'pore-extraction', category: 'SPA', priority: 1 },

    // === WAXING - Additional ===
    { keyword: 'Brazilian Wax', slug: 'brazilian-wax', category: 'SPA', priority: 1 },
    { keyword: 'Arm Waxing', slug: 'arm-waxing', category: 'SPA', priority: 1 },
    { keyword: 'Underarm Wax', slug: 'underarm-wax', category: 'SPA', priority: 1 },
    { keyword: 'Upper Lip Wax', slug: 'upper-lip-wax', category: 'SPA', priority: 1 },
    { keyword: 'Face Waxing', slug: 'face-waxing', category: 'SPA', priority: 1 },
    { keyword: 'Chin Wax', slug: 'chin-wax', category: 'SPA', priority: 1 },
    { keyword: 'Back Wax', slug: 'back-wax', category: 'SPA', priority: 1 },
    { keyword: 'Chest Wax', slug: 'chest-wax', category: 'SPA', priority: 1 },
    { keyword: 'Sugaring', slug: 'sugaring', category: 'SPA', priority: 1 },
    { keyword: 'Threading', slug: 'threading', category: 'SPA', priority: 1 },

    // === AESTHETICS - Additional ===
    { keyword: 'Botox', slug: 'botox', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Dermal Fillers', slug: 'dermal-fillers', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Jawline Filler', slug: 'jawline-filler', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Chin Filler', slug: 'chin-filler', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Under Eye Filler', slug: 'under-eye-filler', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Tear Trough Filler', slug: 'tear-trough-filler', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Nose Filler', slug: 'nose-filler', category: 'AESTHETICS', priority: 1 },
    { keyword: 'PRP Treatment', slug: 'prp-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Vampire Facial', slug: 'vampire-facial', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Skin Tightening', slug: 'skin-tightening', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Radio Frequency', slug: 'radio-frequency', category: 'AESTHETICS', priority: 1 },
    { keyword: 'HIFU Treatment', slug: 'hifu-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Laser Hair Removal', slug: 'laser-hair-removal', category: 'AESTHETICS', priority: 1 },
    { keyword: 'IPL Treatment', slug: 'ipl-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Coolsculpting', slug: 'coolsculpting', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Cavitation', slug: 'cavitation', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Lipo Laser', slug: 'lipo-laser', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Cellulite Treatment', slug: 'cellulite-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Stretch Mark Treatment', slug: 'stretch-mark-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Scar Treatment', slug: 'scar-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Acne Scar Treatment', slug: 'acne-scar-treatment', category: 'AESTHETICS', priority: 1 },
    { keyword: 'Pigmentation Treatment', slug: 'pigmentation-treatment', category: 'AESTHETICS', priority: 1 },

    // === TATTOO & PIERCING ===
    { keyword: 'Tattoo Artist', slug: 'tattoo-artist', category: 'TATTOO', priority: 1 },
    { keyword: 'Tattoo Shop', slug: 'tattoo-shop', category: 'TATTOO', priority: 1 },
    { keyword: 'Custom Tattoo', slug: 'custom-tattoo', category: 'TATTOO', priority: 1 },
    { keyword: 'Fine Line Tattoo', slug: 'fine-line-tattoo', category: 'TATTOO', priority: 1 },
    { keyword: 'Blackwork Tattoo', slug: 'blackwork-tattoo', category: 'TATTOO', priority: 1 },
    { keyword: 'Color Tattoo', slug: 'color-tattoo', category: 'TATTOO', priority: 1 },
    { keyword: 'Cover Up Tattoo', slug: 'cover-up-tattoo', category: 'TATTOO', priority: 1 },
    { keyword: 'Tattoo Removal', slug: 'tattoo-removal', category: 'TATTOO', priority: 1 },
    { keyword: 'Ear Piercing', slug: 'ear-piercing', category: 'PIERCING', priority: 1 },
    { keyword: 'Nose Piercing', slug: 'nose-piercing', category: 'PIERCING', priority: 1 },
    { keyword: 'Belly Button Piercing', slug: 'belly-button-piercing', category: 'PIERCING', priority: 1 },
    { keyword: 'Cartilage Piercing', slug: 'cartilage-piercing', category: 'PIERCING', priority: 1 },
    { keyword: 'Tragus Piercing', slug: 'tragus-piercing', category: 'PIERCING', priority: 1 },
    { keyword: 'Helix Piercing', slug: 'helix-piercing', category: 'PIERCING', priority: 1 },
    { keyword: 'Daith Piercing', slug: 'daith-piercing', category: 'PIERCING', priority: 1 },

    // === HOLISTIC & WELLNESS ===
    { keyword: 'Reiki', slug: 'reiki', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Acupuncture', slug: 'acupuncture', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Sound Healing', slug: 'sound-healing', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Crystal Healing', slug: 'crystal-healing', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Energy Healing', slug: 'energy-healing', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Meditation Classes', slug: 'meditation-classes', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Yoga Studio', slug: 'yoga-studio', category: 'HOLISTIC', priority: 1 },
    { keyword: 'Wellness Center', slug: 'wellness-center', category: 'HOLISTIC', priority: 1 },

    // === GENERAL SEARCHES ===
    { keyword: 'Beauty Salon', slug: 'beauty-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Hair And Beauty', slug: 'hair-and-beauty', category: 'GENERAL', priority: 1 },
    { keyword: 'Full Service Salon', slug: 'full-service-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Unisex Salon', slug: 'unisex-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Ladies Salon', slug: 'ladies-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Mens Salon', slug: 'mens-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Home Salon', slug: 'home-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Salon Suite', slug: 'salon-suite', category: 'GENERAL', priority: 1 },
    { keyword: 'Salon Near Me', slug: 'salon-near-me', category: 'GENERAL', priority: 1 },
    { keyword: 'Best Salon', slug: 'best-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Affordable Salon', slug: 'affordable-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Cheap Salon', slug: 'cheap-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Luxury Salon', slug: 'luxury-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Premium Salon', slug: 'premium-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Open Sunday Salon', slug: 'open-sunday-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Late Night Salon', slug: 'late-night-salon', category: 'GENERAL', priority: 1 },
    { keyword: 'Same Day Appointment', slug: 'same-day-appointment', category: 'GENERAL', priority: 1 },
    { keyword: 'Emergency Hair Appointment', slug: 'emergency-hair-appointment', category: 'GENERAL', priority: 1 },
];

async function addMoreKeywords() {
    console.log('🚀 Adding MORE Extended SEO Keywords to Database...');
    console.log(`📝 Total keywords to add: ${MORE_KEYWORDS.length}\n`);

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const kw of MORE_KEYWORDS) {
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

addMoreKeywords()
    .then(() => {
        console.log('\n✅ More keywords import completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
