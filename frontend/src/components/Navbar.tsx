'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import Image from 'next/image';

export default function Navbar() {
  const { authStatus, user, setAuthStatus } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      if (setAuthStatus) {
        setAuthStatus('unauthenticated');
      }
      setIsLogoutModalOpen(false);
      setIsMenuOpen(false);
      router.push('/');
    }
  };

  // Close mobile menu on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const mainNavLinks = [
    { href: '/salons', label: 'Explore Salons' },
    { href: '/products', label: 'Shop Products' },
  ];
  
  const getUserLinks = () => {
    if (!user) return [];
    const baseLinks = [
      { href: '/my-profile', label: 'My Profile' },
      { href: '/my-bookings', label: 'My Bookings' },
      { href: '/my-favorites', label: 'My Favorites' },
    ];
    switch(user.role) {
      case 'SALON_OWNER': return [{ href: '/dashboard', label: 'Salon Dashboard' }, ...baseLinks];
      case 'PRODUCT_SELLER': return [{ href: '/product-dashboard', label: 'Product Dashboard' }, ...baseLinks];
      case 'ADMIN': return [{ href: '/admin', label: 'Admin Dashboard' }, ...baseLinks];
      default: return baseLinks;
    }
  };

  const authenticatedLinks = getUserLinks();

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/logo-transparent.png" 
                alt="The Salon Hub Logo" 
                width={180} 
                height={45} 
                priority 
              />
            </Link>
          </div>

          <div className={styles.navCenter}>
            {mainNavLinks.map(link => (
              <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>{link.label}</Link>
            ))}
          </div>
          
          <div className={styles.navRight}>
            <div className={styles.desktopAuth}>
              {authStatus === 'unauthenticated' ? (
                <>
                  <button onClick={() => openModal('login')} className={`${styles.navLink} ${styles.authButton}`}>Login</button>
                  <button onClick={() => openModal('register')} className={`btn btn-primary ${styles.registerButton}`}>Sign Up</button>
                </>
              ) : (
                <>
                  {authenticatedLinks.map(link => (
                    <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>{link.label}</Link>
                  ))}
                  <button onClick={() => setIsLogoutModalOpen(true)} className={`${styles.navLink} ${styles.logoutButton}`}>Logout</button>
                </>
              )}
            </div>
            <button ref={hamburgerRef} className={styles.menuIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div ref={menuRef} className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        {mainNavLinks.map(link => (
          <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>{link.label}</Link>
        ))}
        {authStatus === 'authenticated' && <hr className={styles.divider} />}
        {authStatus === 'authenticated' && authenticatedLinks.map(link => (
          <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>{link.label}</Link>
        ))}
        <div className={styles.mobileAuth}>
          <hr className={styles.divider} />
          {authStatus === 'unauthenticated' ? (
            <>
              <button onClick={() => { openModal('login'); setIsMenuOpen(false); }} className={styles.navLink}>Login</button>
              <button onClick={() => { openModal('register'); setIsMenuOpen(false); }} className={`btn btn-primary ${styles.mobileRegisterButton}`}>Sign Up</button>
            </>
          ) : (
            <button onClick={() => {setIsLogoutModalOpen(true); setIsMenuOpen(false);}} className={`${styles.navLink} ${styles.logoutButton}`}>Logout</button>
          )}
        </div>
      </div>

      {isLogoutModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
          confirmText="Logout"
        />
      )}
    </>
  );
}