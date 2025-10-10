'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';
import { FaBars, FaTimes, FaBell, FaCommentDots } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal/ConfirmationModal';
import Image from 'next/image';
import { useSocket } from '@/context/SocketContext';
import { Notification, PaginatedNotifications } from '@/types';
import { toast } from 'react-toastify';
import { ThemeToggle } from './ThemeToggle';

const baseLinkClasses =
  'relative rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--nav-link-active)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--nav-surface)]';
const activeLinkClasses = 'text-[color:var(--nav-link-active)] bg-[color:var(--nav-surface-active)] shadow-sm';
const inactiveLinkClasses = 'text-[color:var(--nav-link)] hover:text-[color:var(--nav-link-hover)] hover:bg-[color:var(--nav-surface-subtle)]';

const NOTIFICATIONS_PAGE_SIZE = 10;

export default function Navbar() {
  const { authStatus, user, logout } = useAuth();
  const { openModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const socket = useSocket();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
 
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCountState, setUnreadCountState] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [viewFilter, setViewFilter] = useState<'all' | 'unread'>('all');
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
        // FIX: Changed the API call to a relative path to use the Next.js proxy
      await fetch(`/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      logout();
      toast.success('You have been logged out successfully.');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLogoutModalOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleChatClick = () => {
    if (authStatus !== 'authenticated') {
      toast.error('Please log in to access messages.');
      openModal('login');
      setIsMenuOpen(false);
      return;
    }

    let handled = false;
    if (typeof window !== 'undefined') {
      if (typeof window.showChatWidget === 'function') {
        window.showChatWidget();
        handled = true;
      }
    }

    if (!handled) {
      router.push('/chat');
    }

    setIsMenuOpen(false);
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
        setNextCursor(payload.nextCursor);
        setUnreadCountState(payload.unreadCount);
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const incoming = options?.append ? payload.items.filter((item) => !existingIds.has(item.id)) : payload.items;
          return options?.append ? [...prev, ...incoming] : payload.items;
        });
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setIsLoadingNotifications(false);
        setIsLoadingMore(false);
      }
    },
    [authStatus],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      socket.on('newNotification', (newNotification: Notification) => {
        setUnreadCountState((count) => count + 1);
        setNotifications((prev) => [newNotification, ...prev]);
      });
      return () => {
        socket.off('newNotification');
      };
    }
  }, [socket]);
  const handleMarkAllRead = async () => {
    try {
      await fetch(`/api/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setUnreadCountState(0);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch(`/api/notifications`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setNotifications([]);
      setNextCursor(null);
      setUnreadCountState(0);
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          credentials: 'include',
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCountState((count) => Math.max(count - 1, 0));
      }
      setIsNotificationsOpen(false);
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error('Failed to update notification', error);
    }
  };


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <nav className="sticky top-0 z-50 border-b border-[color:var(--nav-border)] bg-[color:var(--nav-surface)] backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-transparent.png" alt="The Salon Hub" width={150} height={40} priority />
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${baseLinkClasses} ${pathname === link.href ? activeLinkClasses : inactiveLinkClasses}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              {authStatus === 'loading' && <span className="text-sm text-[color:var(--nav-link)]/70">Loading...</span>}
              {authStatus === 'unauthenticated' && (
                <>
                  <button onClick={() => openModal('login')} className="btn btn-ghost text-sm lowercase">
                    Login
                  </button>
                  <button onClick={() => openModal('register')} className="btn btn-primary text-sm lowercase">
                    Register
                  </button>
                </>
              )}
              {authStatus === 'authenticated' && (
                <>
                  {authenticatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${baseLinkClasses} ${pathname === link.href ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-6 w-px bg-[color:var(--nav-border)]" />
                  <ThemeToggle />
                  <div className="h-6 w-px bg-[color:var(--nav-border)]" />
                  <button
                    onClick={handleChatClick}
                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--nav-icon-bg)] text-[color:var(--nav-text)] transition-colors hover:bg-[color:var(--nav-icon-hover-bg)]"
                    aria-label="Messages"
                  >
                    <FaCommentDots />
                  </button>
                  <div ref={notificationsRef} className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen((prev) => !prev)}
                      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--nav-icon-bg)] text-[color:var(--nav-text)] transition-colors hover:bg-[color:var(--nav-icon-hover-bg)]"
                      aria-label="Notifications"
                    >
                      <FaBell />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-[color:var(--nav-badge-text)]">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[color:var(--nav-border)] bg-[color:var(--nav-surface-active)] p-3 shadow-lg">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--nav-link)]/70">
                          <span>Notifications</span>
                          {notifications.length > 0 && (
                            <div className="flex items-center gap-2 text-[11px] font-semibold normal-case">
                              <button
                                className="text-[color:var(--nav-link-hover)] hover:underline"
                                onClick={handleMarkAllRead}
                              >
                                Mark all read
                              </button>
                              <span className="text-[color:var(--nav-border)]">•</span>
                              <button
                                className="text-[color:var(--color-error, #d64545)] hover:underline"
                                onClick={handleClearNotifications}
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            className={`rounded-md px-2 py-1 font-semibold transition-colors ${
                              viewFilter === 'all'
                                ? 'bg-primary/20 text-[color:var(--nav-text)]'
                                : 'bg-[color:var(--nav-surface-subtle)] text-[color:var(--nav-link)]/70 hover:text-[color:var(--nav-link)]'
                            }`}
                            onClick={() => setViewFilter('all')}
                          >
                            All ({notifications.length})
                          </button>
                          <button
                            type="button"
                            className={`rounded-md px-2 py-1 font-semibold transition-colors ${
                              viewFilter === 'unread'
                                ? 'bg-primary/20 text-[color:var(--nav-text)]'
                                : 'bg-[color:var(--nav-surface-subtle)] text-[color:var(--nav-link)]/70 hover:text-[color:var(--nav-link)]'
                            }`}
                            onClick={() => setViewFilter('unread')}
                          >
                            Unread ({notifications.filter((n) => !n.isRead).length})
                          </button>
                        </div>
                        <div className="max-h-72 space-y-2 overflow-y-auto">
                          {isLoadingNotifications ? (
                            <div className="space-y-2">
                              {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-12 animate-pulse rounded-lg bg-[color:var(--nav-surface-subtle)]" />
                              ))}
                            </div>
                          ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notif) => (
                              <button
                                key={notif.id}
                                type="button"
                                onClick={() => handleNotificationClick(notif)}
                                className={`w-full rounded-lg border border-transparent px-3 py-2 text-sm text-left transition-colors ${
                                  notif.isRead
                                    ? 'text-[color:var(--nav-link)]/70 hover:bg-[color:var(--nav-surface-subtle)]'
                                    : 'border-primary/30 bg-primary/10 text-[color:var(--nav-text)] hover:bg-primary/20'
                                }`}
                              >
                                <div className="flex flex-col gap-1">
                                  <span>{notif.message}</span>
                                  <span className="text-[11px] font-medium text-[color:var(--nav-link)]/60">
                                    {formatTimestamp(notif.createdAt)}
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="rounded-lg bg-[color:var(--nav-surface-subtle)] px-3 py-4 text-sm text-[color:var(--nav-link)]/70">
                              No new notifications.
                            </div>
                          )}
                        </div>
                        {viewFilter === 'all' && nextCursor && (
                          <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="mt-3 w-full rounded-lg bg-[color:var(--nav-surface-subtle)] px-3 py-2 text-sm font-semibold text-[color:var(--nav-link)] hover:bg-[color:var(--nav-surface-subtle)]/80 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isLoadingMore ? 'Loading…' : 'Load older notifications'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setIsLogoutModalOpen(true)} className="btn btn-ghost text-sm lowercase">
                    Logout
                  </button>
                </>
              )}
            </div>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--nav-icon-bg)] text-[color:var(--nav-text)] transition-colors hover:bg-[color:var(--nav-icon-hover-bg)] lg:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`lg:hidden ${
          isMenuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        } fixed inset-x-0 top-20 z-40 bg-[color:var(--nav-surface)] backdrop-blur transition-opacity`}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 sm:px-6 lg:px-8">
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`${baseLinkClasses} ${pathname === link.href ? activeLinkClasses : inactiveLinkClasses}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 h-px bg-[color:var(--nav-border)]/80" />
          <div className="flex items-center justify-between rounded-lg bg-[color:var(--nav-surface-subtle)] px-4 py-3 text-sm font-medium text-[color:var(--nav-link)]/70">
            <span>Appearance</span>
            <ThemeToggle />
          </div>
          <div className="my-2 h-px bg-[color:var(--nav-border)]/80" />

          {authStatus === 'authenticated' && (
            <div className="flex flex-col gap-2">
              {authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${baseLinkClasses} ${pathname === link.href ? activeLinkClasses : inactiveLinkClasses}`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsLogoutModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="btn btn-ghost text-sm lowercase"
              >
                Logout
              </button>
              <button onClick={handleChatClick} className="btn btn-primary text-sm lowercase">
                Messages
              </button>
            </div>
          )}

          {authStatus === 'unauthenticated' && (
            <div className="grid gap-2">
              <button
                onClick={() => {
                  openModal('login');
                  setIsMenuOpen(false);
                }}
                className="btn btn-ghost text-sm lowercase"
              >
                Login
              </button>
              <button
                onClick={() => {
                  openModal('register');
                  setIsMenuOpen(false);
                }}
                className="btn btn-primary text-sm lowercase"
              >
                Register
              </button>
            </div>
          )}

          {authStatus === 'loading' && (
            <span className="text-sm text-[color:var(--nav-link)]/70">Checking session...</span>
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