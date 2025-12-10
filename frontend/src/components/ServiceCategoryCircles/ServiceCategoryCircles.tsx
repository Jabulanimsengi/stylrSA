'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ServiceCategoryCircles.module.css';

// Service categories with local images from public folder
const HOMEPAGE_CATEGORIES = [
    { name: 'Hair', slug: 'haircuts-styling', image: '/hair.jpg', color: '#D4A574' },
    { name: 'Braids', slug: 'braiding-weaving', image: '/braids.jpg', color: '#8B4513' },
    { name: 'Nails', slug: 'nail-care', image: '/nails.jpg', color: '#FF69B4' },
    { name: 'Spa', slug: 'massage-body-treatments', image: '/spa.jpg', color: '#20B2AA' },
    { name: 'Makeup', slug: 'makeup-beauty', image: '/make_up.jpg', color: '#C71585' },
    { name: 'Facials', slug: 'skin-care-facials', image: '/facials.jpg', color: '#87CEEB' },
    { name: 'Barber', slug: 'mens-grooming', image: '/barber.jpg', color: '#2F4F4F' },
    { name: 'Waxing', slug: 'waxing-hair-removal', image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=200&h=200&fit=crop', color: '#DDA0DD' },
    { name: 'Bridal', slug: 'bridal-services', image: '/bridal.jpg', color: '#FFD700' },
    { name: 'Wigs', slug: 'wig-installations', image: '/wig.jpg', color: '#CD853F' },
    { name: 'Natural Hair', slug: 'natural-hair-specialists', image: '/natural_hair.jpg', color: '#228B22' },
    { name: 'Lashes', slug: 'lashes-brows', image: '/lashes.jpg', color: '#9370DB' },
    { name: 'Aesthetics', slug: 'aesthetics-advanced-skin', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=200&h=200&fit=crop', color: '#00CED1' },
    { name: 'Tattoos', slug: 'tattoos-piercings', image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=200&h=200&fit=crop', color: '#2F4F4F' },
    { name: 'Wellness', slug: 'wellness-holistic-spa', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop', color: '#9370DB' },
    { name: 'Color', slug: 'hair-color-treatments', image: '/hair_color.jpg', color: '#FF6347' },
];

export default function ServiceCategoryCircles() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            checkScroll();
            return () => el.removeEventListener('scroll', checkScroll);
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>Browse Categories</h2>
            </div>
            <div className={styles.scrollWrapper}>
                {/* Left Arrow */}
                <button
                    className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${!canScrollLeft ? styles.hidden : ''}`}
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <div className={styles.categoriesContainer}>
                    <div className={styles.categoriesRow} ref={scrollRef}>
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
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        width={90}
                                        height={90}
                                        className={styles.categoryImage}
                                        quality={75}
                                    />
                                </div>
                                <p className={styles.categoryName}>{category.name}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Arrow */}
                <button
                    className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${!canScrollRight ? styles.hidden : ''}`}
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
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
