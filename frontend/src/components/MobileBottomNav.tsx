'use client';
import { FaHome, FaSearch, FaHeart, FaUser, FaCog } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { authStatus, user } = useAuth();
  const { openModal } = useAuthModal();
  
  // Determine account link based on user role
  const getAccountLink = () => {
    if (authStatus !== 'authenticated') return '/my-profile';
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'SALON_OWNER') return '/dashboard';
    if (user?.role === 'PRODUCT_SELLER') return '/product-dashboard';
    return '/my-profile';
  };
  
  const accountHref = getAccountLink();
  
  const navItems = [
    { href: '/', icon: FaHome, label: 'Home' },
    { href: '/salons', icon: FaSearch, label: 'Browse' },
    { href: '/my-favorites', icon: FaHeart, label: 'Favorites', requiresAuth: true },
    { href: accountHref, icon: authStatus === 'authenticated' ? FaCog : FaUser, label: 'Account' },
  ];
  
  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    // If favorites and not authenticated, show auth modal instead
    if (item.requiresAuth && authStatus !== 'authenticated') {
      e.preventDefault();
      openModal('login');
    }
  };
  
  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const { href, icon: Icon, label } = item;
        const isActive = pathname === href || 
          (label === 'Account' && (
            pathname?.startsWith('/my-profile') ||
            pathname?.startsWith('/dashboard') ||
            pathname?.startsWith('/product-dashboard') ||
            pathname?.startsWith('/admin')
          ));
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={(e) => handleNavClick(e, item)}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
