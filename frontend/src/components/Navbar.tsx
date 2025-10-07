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
  
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    // Logout logic remains the same
  };

  // Fetch notifications
  useEffect(() => {
    if (authStatus === 'authenticated') {
      const fetchNotifications = async () => {
        const res = await fetch('http://localhost:3000/api/notifications', { credentials: 'include' });
        if (res.ok) {
          setNotifications(await res.json());
        }
      };
      fetchNotifications();
    }
  }, [authStatus]);

  // Listen for new notifications via WebSocket
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

  // Logic for closing dropdowns when clicking outside
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
  
  // Link generation logic remains the same

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
            {/* Logo */}
          </div>

          <div className={styles.navCenter}>
            {/* Main Links */}
          </div>
          
          <div className={styles.navRight}>
            <div className={styles.desktopAuth}>
              {authStatus === 'unauthenticated' ? (
                <>
                  {/* Login/Register Buttons */}
                </>
              ) : (
                <>
                  {/* User Links */}
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

      {/* Mobile Menu */}

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