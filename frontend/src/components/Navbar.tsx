'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';
import { FaBell, FaEnvelope, FaBars, FaTimes, FaTrash } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export default function Navbar() {
  const { authStatus, userRole, setAuthStatus } = useAuth();
  const { openModal } = useAuthModal();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };
  
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchNotifications();
    }
  }, [authStatus]);

  useEffect(() => {
    if (socket) {
      const handleNewNotification = () => {
        toast.info("You have a new notification!");
        fetchNotifications();
      };
      socket.on('newNotification', handleNewNotification);
      return () => { socket.off('newNotification'); };
    }
  }, [socket]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notif: Notification) => {
    const token = localStorage.getItem('access_token');
    if (!notif.isRead) {
      await fetch(`http://localhost:3000/api/notifications/${notif.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    fetchNotifications();
    setShowNotifications(false);
    if(notif.link) {
      router.push(notif.link)
    }
  };

  const handleNotificationDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent the click from navigating
    const token = localStorage.getItem('access_token');
    await fetch(`http://localhost:3000/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };


  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('access_token');
    setIsLogoutModalOpen(false);
    if (setAuthStatus) {
      setAuthStatus('unauthenticated');
    }
    router.push('/');
    setIsMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMenuOpen(false);

  return (
    <>
      {isLogoutModalOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={confirmLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
          confirmText="Logout"
        />
      )}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo-transparent.png" 
            alt="Salorify Logo" 
            width={140} 
            height={35} 
            priority 
          />
        </Link>
        
        <div className={styles.navActions}>
            {authStatus === 'authenticated' && (
                <div className={styles.mobileIcons}>
                    <Link href="/chat" className={styles.iconButton} title="Messages" onClick={closeMobileMenu}><FaEnvelope /></Link>
                    <div ref={notificationRef} className={styles.notificationWrapper}>
                      <button onClick={() => setShowNotifications(!showNotifications)} className={styles.iconButton} title="Notifications">
                        <FaBell />
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                      </button>
                      {showNotifications && (
                        <div className={styles.dropdown}>
                          <div className={styles.dropdownHeader}>Notifications</div>
                          {notifications.length > 0 ? notifications.map(notif => (
                            <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}>
                              <span>{notif.message}</span>
                              <button onClick={(e) => handleNotificationDelete(e, notif.id)} className={styles.deleteNotificationButton}>
                                <FaTrash />
                              </button>
                            </div>
                          )) : <div className={styles.noNotifications}>No notifications yet.</div>}
                        </div>
                      )}
                    </div>
                </div>
            )}
            <div className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </div>
        </div>


        <div className={`${styles.linksContainer} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <Link href="/salons" className={`${styles.link} ${pathname === '/salons' ? styles.activeLink : ''}`} onClick={closeMobileMenu}>Salons</Link>
          
          {authStatus === 'authenticated' ? (
            <>
              <Link href="/my-bookings" className={`${styles.link} ${pathname === '/my-bookings' ? styles.activeLink : ''}`} onClick={closeMobileMenu}>My Bookings</Link>
              <Link href="/my-favorites" className={`${styles.link} ${pathname === '/my-favorites' ? styles.activeLink : ''}`} onClick={closeMobileMenu}>My Favorites</Link>
              {userRole === 'SALON_OWNER' && <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.activeLink : ''}`} onClick={closeMobileMenu}>Dashboard</Link>}
              {userRole === 'ADMIN' && <Link href="/admin" className={`${styles.link} ${pathname === '/admin' ? styles.activeLink : ''}`} onClick={closeMobileMenu}>Admin</Link>}
              
              <div className={styles.mobileAuthActions}>
                <button onClick={handleLogoutClick} className="btn btn-ghost">Logout</button>
              </div>
            </>
          ) : (
            <div className={styles.mobileAuthActions}>
              <button onClick={() => { openModal('login'); closeMobileMenu(); }} className={styles.link}>Login</button>
              <button onClick={() => { openModal('register'); closeMobileMenu(); }} className="btn btn-primary">Sign Up</button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}