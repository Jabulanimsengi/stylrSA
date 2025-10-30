'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useAuthModal } from '@/context/AuthModalContext';
import {
  FaBars,
  FaTimes,
  FaBell,
  FaCommentDots,
  FaHome,
  FaCut,
  FaMagic,
  FaBoxOpen,
  FaHeart,
  FaCalendarCheck,
  FaUser,
  FaChartLine,
  FaStore,
  FaShieldAlt,
  FaSignOutAlt,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import { useSocket } from '@/context/SocketContext';
import { Notification, PaginatedNotifications } from '@/types';
import { toast } from 'react-toastify';
import { ThemeToggle } from './ThemeToggle';
import styles from './Navbar.module.css';
import { toFriendlyMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

const NOTIFICATIONS_CACHE_KEY = 'nav-notifications-cache';
const NOTIFICATIONS_PAGE_SIZE = 10;

interface NavLinkItem {
  href: string;
  label: string;
  icon: IconType;
  match?: (path: string) => boolean;
}

export default function Navbar() {
  const { authStatus, user, logout } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'unread'>('all');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const notificationsPortalRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasPrefetchedRoutes, setHasPrefetchedRoutes] = useState(false);

  const updateNotificationsCache = useCallback((items: Notification[], unread: number, cursor: string | null) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(
        NOTIFICATIONS_CACHE_KEY,
        JSON.stringify({
          items,
          unreadCount: unread,
          nextCursor: cursor,
          timestamp: Date.now(),
        }),
      );
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = sessionStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    if (!cached) return;
    try {
      const parsed = JSON.parse(cached) as {
        items?: Notification[];
        unreadCount?: number;
        nextCursor?: string | null;
      };
      if (Array.isArray(parsed.items)) {
        setNotifications(parsed.items);
        setUnreadCountState(parsed.unreadCount ?? 0);
        setNextCursor(parsed.nextCursor ?? null);
      }
    } catch {
      sessionStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Clear NextAuth session (Google/OAuth)
      try { await signOut({ redirect: false }); } catch {}
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      logout();
      toast.success('You have been logged out successfully.');
      router.push('/');
    } catch (error) {
      logger.error('Logout failed:', error);
      toast.error(toFriendlyMessage(error, 'Logout failed. Please try again.'));
    } finally {
      setIsLogoutModalOpen(false);
      setIsMobileOpen(false);
    }
  };

  const handleChatClick = () => {
    if (authStatus !== 'authenticated') {
      toast.error('Please log in to access messages.');
      openModal('login');
      setIsMobileOpen(false);
      return;
    }

    if (typeof window !== 'undefined' && typeof window.showChatWidget === 'function') {
      window.showChatWidget();
    } else {
      toast.error('Chat widget is not available. Please refresh the page.');
    }

    setIsMobileOpen(false);
  };

  const fetchNotifications = useCallback(
    async (options?: { cursor?: string; append?: boolean }) => {
      if (authStatus !== 'authenticated') return;

      if (options?.append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingNotifications(true);
      }

      try {
        const params = new URLSearchParams({ limit: NOTIFICATIONS_PAGE_SIZE.toString() });
        if (options?.cursor) {
          params.append('cursor', options.cursor);
        }

        const res = await fetch(`/api/notifications?${params.toString()}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch notifications: ${res.status}`);
        }

        const payload: PaginatedNotifications = await res.json();
        let nextItems: Notification[] = [];
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const incoming = options?.append
            ? payload.items.filter((item) => !existingIds.has(item.id))
            : payload.items;
          nextItems = options?.append ? [...prev, ...incoming] : payload.items;
          return nextItems;
        });
        const unreadValue = payload.unreadCount ?? nextItems.filter((n) => !n.isRead).length;
        setUnreadCountState(unreadValue);
        setNextCursor(payload.nextCursor ?? null);
        updateNotificationsCache(nextItems, unreadValue, payload.nextCursor ?? null);
      } catch (error) {
        logger.error('Failed to load notifications', error);
        toast.error(toFriendlyMessage(error, 'Failed to load notifications.'));
      } finally {
        setIsLoadingNotifications(false);
        setIsLoadingMore(false);
      }
    },
    [authStatus, updateNotificationsCache],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handler = (newNotification: Notification) => {
      setUnreadCountState((count) => count + 1);
      setNotifications((prev) => [newNotification, ...prev]);
    };
    socket.on('newNotification', handler);
    return () => {
      socket.off('newNotification', handler);
    };
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });
      let nextItems: Notification[] = [];
      setNotifications((prev) => {
        nextItems = prev.map((notif) => ({ ...notif, isRead: true }));
        return nextItems;
      });
      setUnreadCountState(0);
      updateNotificationsCache(nextItems, 0, nextCursor);
    } catch (error) {
      logger.error('Failed to mark notifications as read', error);
      toast.error(toFriendlyMessage(error, 'Failed to mark notifications as read.'));
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        credentials: 'include',
      });
      setNotifications([]);
      setNextCursor(null);
      setUnreadCountState(0);
      updateNotificationsCache([], 0, null);
    } catch (error) {
      logger.error('Failed to clear notifications', error);
      toast.error(toFriendlyMessage(error, 'Failed to clear notifications.'));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          credentials: 'include',
        });
        let updatedItems: Notification[] = [];
        setNotifications((prev) => {
          updatedItems = prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n));
          return updatedItems;
        });
        const nextUnread = updatedItems.filter((n) => !n.isRead).length;
        setUnreadCountState(nextUnread);
        updateNotificationsCache(updatedItems, nextUnread, nextCursor);
      }
      setIsNotificationsOpen(false);
      
      // Handle chat notifications by opening the ChatWidget directly
      if (notification.link?.startsWith('/chat/')) {
        const conversationId = notification.link.replace('/chat/', '');
        if (typeof window !== 'undefined' && typeof window.showChatWidget === 'function') {
          window.showChatWidget(conversationId);
        } else {
          toast.error('Chat widget is not available. Please refresh the page.');
        }
      } else if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      logger.error('Failed to update notification', error);
      toast.error(toFriendlyMessage(error, 'Failed to update notification.'));
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideAnchor = notificationsRef.current?.contains(target);
      const clickedInsidePortal = notificationsPortalRef.current?.contains(target);
      if (!clickedInsideAnchor && !clickedInsidePortal) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const update = () => setIsDesktop(typeof window !== 'undefined' ? window.innerWidth > 1024 : false);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    await fetchNotifications({ cursor: nextCursor, append: true });
  };

  const unreadCount = unreadCountState ?? notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (viewFilter === 'unread') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, viewFilter]);

  const formatTimestamp = (isoDate: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(isoDate));
    } catch {
      return '';
    }
  };

  const discoverLinks: NavLinkItem[] = useMemo(
    () => [
      { href: '/', label: 'Home Feed', icon: FaHome },
      { href: '/salons', label: 'Salons', icon: FaCut },
      { href: '/services', label: 'Services', icon: FaMagic },
      { href: '/products', label: 'Products', icon: FaBoxOpen },
      { href: '/promotions', label: 'Promotions', icon: FaMagic },
    ],
    [],
  );

  const personalLinks: NavLinkItem[] = useMemo(() => {
    if (!user) return [];
    const base: NavLinkItem[] = [
      { href: '/my-profile', label: 'My Profile', icon: FaUser },
      { href: '/my-bookings', label: 'My Bookings', icon: FaCalendarCheck },
      { href: '/my-favorites', label: 'Saved Salons', icon: FaHeart },
    ];
    if (user.role === 'SALON_OWNER') {
      return [{ href: '/dashboard', label: 'Salon Dashboard', icon: FaChartLine }, ...base];
    }
    if (user.role === 'PRODUCT_SELLER') {
      return [{ href: '/product-dashboard', label: 'Product Dashboard', icon: FaStore }, ...base];
    }
    if (user.role === 'ADMIN') {
      return [{ href: '/admin', label: 'Admin Console', icon: FaShieldAlt }, ...base];
    }
    return base;
  }, [user]);

  useEffect(() => {
    if ((!isMobileOpen && !isNotificationsOpen) || authStatus !== 'authenticated' || hasPrefetchedRoutes) {
      return;
    }
    if (typeof router.prefetch !== 'function') {
      return;
    }

    const routes = new Set<string>(['/my-profile', '/my-bookings', '/my-favorites']);
    if (user?.role === 'SALON_OWNER') {
      routes.add('/dashboard');
    } else if (user?.role === 'PRODUCT_SELLER') {
      routes.add('/product-dashboard');
    } else if (user?.role === 'ADMIN') {
      routes.add('/admin');
    }
    routes.forEach((route) => {
      const maybePromise = router.prefetch(route);
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.catch(() => {});
      }
    });
    setHasPrefetchedRoutes(true);
  }, [isMobileOpen, isNotificationsOpen, authStatus, user?.role, hasPrefetchedRoutes, router]);

  const isLinkActive = (link: NavLinkItem) => {
    if (link.match) {
      return link.match(pathname ?? '');
    }
    if (!pathname) return false;
    if (link.href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(link.href);
  };

  const renderNavLink = (link: NavLinkItem) => {
    const active = isLinkActive(link);
    const cls = `${styles.navItem} ${active ? styles.navItemActive : ''}`.trim();
    const Icon = link.icon;
    return (
      <li key={link.href}>
        <Link href={link.href} className={cls} onClick={() => setIsMobileOpen(false)}>
          <span className={styles.navIcon} aria-hidden>
            <Icon />
          </span>
          <span className={styles.navLabel}>{link.label}</span>
        </Link>
      </li>
    );
  };

  const panelBody = (
    <>
      <div className={styles.notificationsHeader}>
        <span>Notifications</span>
        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', fontWeight: 600 }}>
            <button
              type="button"
              className={styles.notificationsFooterButton}
              onClick={handleMarkAllRead}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              Mark all read
            </button>
            <button
              type="button"
              className={styles.notificationsFooterButton}
              onClick={handleClearNotifications}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className={styles.notificationsFilters}>
        <button
          type="button"
          className={`${styles.notificationsFilterButton} ${viewFilter === 'all' ? styles.notificationsFilterActive : ''}`}
          onClick={() => setViewFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          className={`${styles.notificationsFilterButton} ${viewFilter === 'unread' ? styles.notificationsFilterActive : ''}`}
          onClick={() => setViewFilter('unread')}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>
      <div className={styles.notificationsList}>
        {isLoadingNotifications ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="skeleton" style={{ height: '3rem' }} />
          ))
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <button
              key={notif.id}
              type="button"
              onClick={() => handleNotificationClick(notif)}
              className={`${styles.notificationItem} ${!notif.isRead ? styles.notificationUnread : ''}`.trim()}
            >
              <span>{notif.message}</span>
              <span className={styles.notificationMeta}>{formatTimestamp(notif.createdAt)}</span>
            </button>
          ))
        ) : (
          <div className={styles.notificationItem}>No new notifications.</div>
        )}
      </div>
      {viewFilter === 'all' && nextCursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className={styles.notificationsFooterButton}
        >
          {isLoadingMore ? 'Loading…' : 'Load older notifications'}
        </button>
      )}
    </>
  );

  const notificationsButton = (
    <button
      type="button"
      className={`${styles.navItem} ${styles.navButton}`}
      onClick={() => setIsNotificationsOpen((prev) => !prev)}
    >
      <span className={styles.navIcon} aria-hidden>
        <FaBell />
      </span>
      <span className={styles.navLabel}>Notifications</span>
      {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
    </button>
  );

  const notificationsPanel = isNotificationsOpen && (
    isDesktop
      ? createPortal(
          <div ref={notificationsPortalRef} className={`${styles.notificationsPanel} ${styles.notificationsPortalPanel}`}>
            {panelBody}
          </div>,
          document.body,
        )
      : (
          <div ref={notificationsRef} className={styles.notificationsPanel}>
            {panelBody}
          </div>
        )
  );

  const messagesButton = (
    <button
      type="button"
      onClick={handleChatClick}
      className={`${styles.navItem} ${styles.navButton}`}
    >
      <span className={styles.navIcon} aria-hidden>
        <FaCommentDots />
      </span>
      <span className={styles.navLabel}>Messages</span>
    </button>
  );

  const signOutButton = (
    <button
      type="button"
      className={`${styles.navItem} ${styles.navButton}`}
      onClick={() => setIsLogoutModalOpen(true)}
    >
      <span className={styles.navIcon} aria-hidden>
        <FaSignOutAlt />
      </span>
      <span className={styles.navLabel}>Sign out</span>
    </button>
  );

  const authButtons = (
    <div className={styles.authActions}>
      <button
        type="button"
        className="btn btn-ghost text-sm lowercase"
        onClick={() => {
          openModal('login');
          setIsMobileOpen(false);
        }}
      >
        Login
      </button>
      <button
        type="button"
        className="btn btn-primary text-sm lowercase"
        onClick={() => {
          openModal('register');
          setIsMobileOpen(false);
        }}
      >
        Register
      </button>
    </div>
  );

  return (
    <>
      <header className={styles.mobileBar}>
        <button
          type="button"
          className={styles.iconOnlyButton}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => setIsMobileOpen(false)}
          aria-label="Stylr SA home"
        >
          <Image src="/logo-transparent.png" alt="Stylr SA" width={124} height={32} priority />
        </Link>
        <div className={styles.mobileActions}>
          {authStatus === 'authenticated' ? (
            <>
              <button
                type="button"
                className={styles.iconOnlyButton}
                onClick={handleChatClick}
                aria-label="Messages"
              >
                <FaCommentDots />
              </button>
              <button
                type="button"
                className={`${styles.iconOnlyButton} ${styles.notificationButton}`}
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                aria-label="Notifications"
              >
                <FaBell />
                {unreadCount > 0 && <span className={styles.mobileBadge}>{unreadCount}</span>}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary text-sm lowercase"
              onClick={() => openModal('login')}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <div
        className={`${styles.sidebarBackdrop} ${isMobileOpen ? styles.sidebarBackdropVisible : ''}`.trim()}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`.trim()}>
        <div className={styles.sidebarContent}>
          <div className={styles.logoRow}>
            <Link
              href="/"
              className={styles.brand}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Stylr SA home"
            >
              <Image src="/logo-transparent.png" alt="Stylr SA" width={140} height={36} priority />
            </Link>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation"
            >
              <FaTimes />
            </button>
          </div>

          <div className={styles.topControls}>
            <div className={styles.themeToggleShell}>
              <ThemeToggle />
            </div>
          </div>

          <nav>
            <p className={styles.sectionLabel}>Discover</p>
            <ul className={styles.navList}>{discoverLinks.map(renderNavLink)}</ul>
          </nav>

          {authStatus === 'authenticated' && (
            <div>
              <p className={styles.sectionLabel}>Account</p>
              <div className={styles.supportActions}>
                <div className={styles.desktopOnlyActions}>
                  {notificationsButton}
                  {messagesButton}
                </div>
                {signOutButton}
              </div>
            </div>
          )}

          {authStatus === 'authenticated' && personalLinks.length > 0 && (
            <nav>
              <p className={styles.sectionLabel}>My Hub</p>
              <ul className={styles.navList}>{personalLinks.map(renderNavLink)}</ul>
            </nav>
          )}

          <div className={styles.sidebarFooter}>
            {authStatus === 'authenticated' ? null : (
              authButtons
            )}
          </div>
        </div>
      </aside>

      {notificationsPanel}

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