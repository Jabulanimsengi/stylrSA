'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';
import { FaBell, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const { authStatus, userRole } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const socket = useSocket();
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

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
    await fetch(`http://localhost:3000/api/notifications/${notif.id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
    setShowNotifications(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('access_token');
      router.push('/');
    }
  };

  return (
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
      <div className={styles.linksContainer}>
        <Link href="/salons" className={styles.link}>Salons</Link>
        
        {authStatus === 'authenticated' ? (
          <>
            <Link href="/my-bookings" className={styles.link}>My Bookings</Link>
            {userRole === 'SALON_OWNER' && <Link href="/dashboard" className={styles.link}>Dashboard</Link>}
            {userRole === 'ADMIN' && <Link href="/admin" className={styles.link}>Admin</Link>}
            
            <Link href="/chat" className={styles.iconButton} title="Messages"><FaEnvelope /></Link>
            
            <div ref={notificationRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className={styles.iconButton} title="Notifications">
                <FaBell />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>Notifications</div>
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}>
                      {notif.message}
                    </div>
                  )) : <div className={styles.noNotifications}>No notifications yet.</div>}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.link}>Login</Link>
            <button onClick={() => router.push('/register')} className="btn btn-primary">Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
}