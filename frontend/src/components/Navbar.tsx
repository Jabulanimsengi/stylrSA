// frontend/src/components/Navbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import Image from 'next/image';

export default function Navbar() {
  const { authStatus, user, setAuthStatus } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setIsDropdownOpen(false);
      router.push('/');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);


  const navLinks = [
    { href: '/salons', label: 'Explore Salons' },
    { href: '/products', label: 'Shop Products' },
  ];
  
  const userLinks = [
    { href: '/my-profile', label: 'My Profile' },
    { href: '/my-bookings', label: 'My Bookings' },
    { href: '/my-favorites', label: 'My Favorites' },
  ];

  const salonOwnerLinks = [
    { href: '/dashboard', label: 'Salon Dashboard' },
    ...userLinks,
  ];

  const productSellerLinks = [
    { href: '/product-dashboard', label: 'Product Dashboard' },
    ...userLinks,
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard' },
    ...userLinks,
  ];

  const getDropdownLinks = () => {
    if (!user) return [];
    switch(user.role) {
      case 'SALON_OWNER': return salonOwnerLinks;
      case 'PRODUCT_SELLER': return productSellerLinks;
      case 'ADMIN': return adminLinks;
      default: return userLinks;
    }
  };

  const renderNavLinks = (isMobile = false) => (
    <>
      {navLinks.map(link => (
        <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>{link.label}</Link>
      ))}
       {authStatus === 'authenticated' && isMobile && getDropdownLinks().map(link => (
          <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>{link.label}</Link>
       ))}
    </>
  );

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <Image 
              src="/logo-transparent.png" 
              alt="The Salon Hub Logo" 
              width={180} 
              height={45} 
              priority 
            />
          </Link>

          <div className={styles.navLinks}>
            {renderNavLinks()}
          </div>
          
          <div className={styles.navActions}>
            <div className={styles.desktopAuth}>
              {authStatus === 'unauthenticated' ? (
                <>
                  <button onClick={() => openModal('login')} className={`${styles.navLink} ${styles.authButton}`}>Login</button>
                  <button onClick={() => openModal('register')} className={`btn btn-primary ${styles.registerButton}`}>Sign Up</button>
                </>
              ) : (
                <div className={styles.profileDropdown} ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={styles.profileButton}>
                    <FaUserCircle size={28} />
                  </button>
                  {isDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {getDropdownLinks().map(link => (
                         <Link key={link.href} href={link.href} className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>{link.label}</Link>
                      ))}
                      <button onClick={() => setIsLogoutModalOpen(true)} className={styles.dropdownItem}>Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.menuIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          {renderNavLinks(true)}
          
          <div className={styles.mobileAuth}>
            {authStatus === 'unauthenticated' ? (
              <>
                <button onClick={() => { openModal('login'); setIsMenuOpen(false); }} className={`btn btn-ghost`}>Login</button>
                <button onClick={() => { openModal('register'); setIsMenuOpen(false); }} className={`btn btn-primary`}>Sign Up</button>
              </>
            ) : (
              <button onClick={() => setIsLogoutModalOpen(true)} className={`btn btn-ghost`}>Logout</button>
            )}
          </div>
        </div>
      )}

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