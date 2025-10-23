'use client';

import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {showHome && (
          <>
            <li className={styles.item}>
              <Link href="/" className={styles.link}>
                <FaHome className={styles.homeIcon} />
                <span className={styles.label}>Home</span>
              </Link>
            </li>
            {items.length > 0 && (
              <li className={styles.separator}>
                <FaChevronRight />
              </li>
            )}
          </>
        )}
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {item.active || !item.href ? (
              <span className={`${styles.link} ${styles.active}`} aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <span className={styles.separator}>
                <FaChevronRight />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
