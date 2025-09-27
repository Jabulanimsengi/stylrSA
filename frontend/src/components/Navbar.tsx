'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import styles from './Navbar.module.css';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'react-toastify';
import { FaBell, FaEnvelope } from 'react-icons/fa';

interface DecodedToken {
  role: 'CLIENT' | 'SALON_OWNER' | 'ADMIN';
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const res = await fetch('http://localhost:3000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setNotifications(await res.json());
    }
  };

  // Check auth status on route changes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        localStorage.removeItem('access_token');
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [pathname]);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (userRole) {
      fetchNotifications();
    }
  }, [userRole]);

  // Listen for socket events
  useEffect(() => {
    if (socket) {
      socket.on('newNotification', () => {
        toast.info("You have a new notification!");
        fetchNotifications();
      });
      return () => { socket.off('newNotification'); };
    }
  }, [socket]);
  
  // Close dropdown when clicking outside
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
    fetchNotifications(); // Refresh list to show it as "read"
    setShowNotifications(false);
    // TODO: Add router.push to the relevant booking/chat page later
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUserRole(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        SalonDirect
      </Link>
      <div className={styles.linksContainer}>
        <Link href="/salons" className={styles.link}>Salons</Link>
        
        {userRole ? (
          <>
            {userRole === 'SALON_OWNER' && <Link href="/dashboard" className={styles.link}>Dashboard</Link>}
            {userRole === 'ADMIN' && <Link href="/admin" className={styles.link}>Admin</Link>}
            {userRole === 'CLIENT' && <Link href="/my-bookings" className={styles.link}>My Bookings</Link>}
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
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.link}>Login</Link>
            <Link href="/register" className={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}