'use client';

import Link from 'next/link';
import styles from './ServiceCategoryCircles.module.css';

// Service categories with icons/emojis as placeholders
// These can be replaced with actual images from Cloudinary
const HOMEPAGE_CATEGORIES = [
    { name: 'Hair', slug: 'haircuts-styling', icon: '💇', color: '#D4A574' },
    { name: 'Braids', slug: 'braiding-weaving', icon: '✨', color: '#8B4513' },
    { name: 'Nails', slug: 'nail-care', icon: '💅', color: '#FF69B4' },
    { name: 'Spa', slug: 'massage-body-treatments', icon: '🧖', color: '#20B2AA' },
    { name: 'Makeup', slug: 'makeup-beauty', icon: '💄', color: '#C71585' },
    { name: 'Facials', slug: 'skin-care-facials', icon: '🧴', color: '#87CEEB' },
    { name: 'Barber', slug: 'mens-grooming', icon: '💈', color: '#2F4F4F' },
    { name: 'Waxing', slug: 'waxing-hair-removal', icon: '✂️', color: '#DDA0DD' },
    { name: 'Bridal', slug: 'bridal-services', icon: '👰', color: '#FFD700' },
    { name: 'Wigs', slug: 'wig-installations', icon: '👩', color: '#CD853F' },
    { name: 'Natural Hair', slug: 'natural-hair-specialists', icon: '🌿', color: '#228B22' },
    { name: 'Lashes', slug: 'lashes-brows', icon: '👁️', color: '#9370DB' },
    { name: 'Aesthetics', slug: 'aesthetics-advanced-skin', icon: '💎', color: '#00CED1' },
    { name: 'Tattoos', slug: 'tattoos-piercings', icon: '🎨', color: '#2F4F4F' },
    { name: 'Wellness', slug: 'wellness-holistic-spa', icon: '🧘', color: '#9370DB' },
    { name: 'Color', slug: 'hair-color-treatments', icon: '🎨', color: '#FF6347' },
];

export default function ServiceCategoryCircles() {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>Browse Categories</h2>
            </div>
            <div className={styles.categoriesContainer}>
                <div className={styles.categoriesRow}>
                    {HOMEPAGE_CATEGORIES.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/services/${category.slug}`}
                            className={styles.categoryItem}
                        >
                            <div
                                className={styles.categoryCircle}
                                style={{ background: `linear-gradient(135deg, ${category.color} 0%, ${adjustColor(category.color, -30)} 100%)` }}
                            >
                                <span className={styles.categoryIcon}>{category.icon}</span>
                            </div>
                            <p className={styles.categoryName}>{category.name}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Helper to darken a hex color
function adjustColor(hex: string, amount: number): string {
    const clamp = (num: number) => Math.min(255, Math.max(0, num));

    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust
    const newR = clamp(r + amount);
    const newG = clamp(g + amount);
    const newB = clamp(b + amount);

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
