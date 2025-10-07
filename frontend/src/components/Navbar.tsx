'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { FaBars, FaTimes, FaBell, FaCommentDots } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';
import { Notification } from '@/types';

export default function Navbar() {
  const { authStatus, user, setAuthStatus } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthStatus('unauthenticated');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLogoutModalOpen(false);
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      const fetchNotifications = async () => {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          setNotifications(await res.json());
        }
      };
      fetchNotifications();
    }
  }, [authStatus]);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (newNotification: Notification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });
      return () => {
        socket.off('newNotification');
      };
    }
  }, [socket]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const mainLinks = [
    { href: '/', label: 'Home' },
    { href: '/salons', label: 'Salons' },
    { href: '/products', label: 'Products' },
  ];

  const getLinks = () => {
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
  const authenticatedLinks = getLinks();
  
  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <Link href="/" className={styles.logo}>
              <Image src="/logo-transparent.png" alt="The Salon Hub" width={150} height={40} priority />
            </Link>
          </div>

          <div className={styles.navCenter}>
            {mainLinks.map(link => (
              <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className={styles.navRight}>
            <div className={styles.desktopAuth}>
              {authStatus === 'loading' ? (
                <div className={styles.navLink}>Loading...</div>
              ) : authStatus === 'unauthenticated' ? (
                <>
                  <button onClick={() => openModal('login')} className={`${styles.navLink} ${styles.loginButton}`}>Login</button>
                  <button onClick={() => openModal('register')} className={`${styles.navLink} ${styles.registerButton}`}>Register</button>
                </>
              ) : (
                <>
                  {authenticatedLinks.map(link => (
                    <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}>
                      {link.label}
                    </Link>
                  ))}
                   <div className={styles.verticalDivider} />
                  <Link href="/chat" className={styles.iconButton} aria-label="Messages">
                    <FaCommentDots />
                  </Link>
                  <div className={styles.notificationContainer} ref={notificationsRef}>
                    <button onClick={() => setIsNotificationsOpen(prev => !prev)} className={styles.iconButton} aria-label="Notifications">
                      <FaBell />
                      {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
                    </button>
                    {isNotificationsOpen && (
                      <div className={styles.notificationDropdown}>
                        <div className={styles.notificationHeader}>Notifications</div>
                        {notifications.length > 0 ? notifications.map(notif => (
                          <div key={notif.id} className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}>
                            {notif.message}
                          </div>
                        )) : <div className={styles.notificationItem}>No new notifications.</div>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setIsLogoutModalOpen(true)} className={`${styles.navLink} ${styles.logoutButton}`}>Logout</button>
                </>
              )}
            </div>
            <button className={styles.menuIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        {mainLinks.map(link => (
          <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`} onClick={() => setIsMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className={styles.divider} />
        {authStatus === 'authenticated' && authenticatedLinks.map(link => (
          <Link key={link.href} href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`} onClick={() => setIsMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
        <div className={styles.mobileAuth}>
          {authStatus === 'loading' ? (
             <div className={styles.navLink}>Loading...</div>
          ) : authStatus === 'unauthenticated' ? (
            <>
              <button onClick={() => { openModal('login'); setIsMenuOpen(false); }} className={`${styles.navLink} ${styles.loginButton}`}>Login</button>
              <button onClick={() => { openModal('register'); setIsMenuOpen(false); }} className={`${styles.navLink} ${styles.registerButton}`}>Register</button>
            </>
          ) : (
            <button onClick={() => setIsLogoutModalOpen(true)} className={`${styles.navLink} ${styles.logoutButton}`}>Logout</button>
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