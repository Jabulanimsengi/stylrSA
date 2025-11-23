import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';
import styles from './Breadcrumbs.module.css';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    if (!items || items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol className={styles.breadcrumbs} style={{ margin: 0, padding: 0, listStyle: 'none', background: 'transparent' }}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className={styles.item}>
                            {index > 0 && (
                                <span className={styles.separator} aria-hidden="true">
                                    <FaChevronRight />
                                </span>
                            )}
                            {isLast ? (
                                <span className={styles.current} aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link href={item.href || '#'} className={styles.link}>
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
