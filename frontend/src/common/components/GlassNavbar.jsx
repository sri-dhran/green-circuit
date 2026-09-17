import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../../modules/user/context/AuthContext';
import { notificationService } from '../../modules/notification/api/notificationService';
import './GlassNavbar.css';

const GlassNavbar = ({ activeTab, onTabChange }) => {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications for logged-in user
  useEffect(() => {
    if (!user) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 45000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <header className="gc-navbar-wrapper">
      <nav className="gc-navbar">
        {/* Brand Area */}
        <div className="gc-nav-brand" onClick={() => {
          if (user.role === 'SUPER_ADMIN' && user.email?.toLowerCase() === 'sri741815@gmail.com') navigate('/admin');
          else if (user.role === 'OFFICE') navigate('/dashboard');
          else navigate('/user-dashboard');
        }}>
          <div className="gc-nav-logo-icon">♻</div>
          <div className="gc-nav-brand-text">
            <span className="gc-brand-title">Green Circuit</span>
            <span className="gc-brand-tagline">Smart E-Waste</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="gc-nav-links">
          {user.role === 'USER' && (
            <>
              <button
                className={`gc-nav-link ${location.pathname === '/user-dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/user-dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`gc-nav-link ${location.pathname === '/reward-store' ? 'active' : ''}`}
                onClick={() => navigate('/reward-store')}
              >
                Reward Store
              </button>
            </>
          )}

          {user.role === 'OFFICE' && (
            <>
              <button
                className={`gc-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                Office Console
              </button>
            </>
          )}

          {user.role === 'SUPER_ADMIN' && user.email?.toLowerCase() === 'sri741815@gmail.com' && (
            <>
              <button
                className={`gc-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                Analytics
              </button>
              <button
                className={`gc-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                Office Registry
              </button>
            </>
          )}
        </div>

        {/* Right Section: Rewards, Notifications, Profile, Logout */}
        <div className="gc-nav-right">
          {/* Rewards Pill (for USER) */}
          {user.role === 'USER' && (
            <div
              className="gc-nav-points-pill"
              onClick={() => navigate('/reward-store')}
              title="Click to view Reward Store"
            >
              <span className="gc-points-icon">🏆</span>
              <span className="gc-points-num">{user.rewardPoints ?? 0}</span>
              <span className="gc-points-label">Pts</span>
            </div>
          )}

          {/* Notifications Button & Popover */}
          <div className="gc-notif-container" ref={notifRef}>
            <button
              className="gc-nav-icon-btn"
              onClick={() => setShowNotifPopover((prev) => !prev)}
              aria-label="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && <span className="gc-notif-badge">{unreadCount}</span>}
            </button>

            {showNotifPopover && (
              <div className="gc-notif-popover">
                <div className="gc-notif-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="gc-notif-count-pill">{unreadCount} New</span>
                  )}
                </div>
                <div className="gc-notif-list">
                  {notifications.length === 0 ? (
                    <div className="gc-notif-empty">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`gc-notif-item ${!n.read ? 'unread' : ''}`}
                      >
                        <div className="gc-notif-body">
                          <p className="gc-notif-text">{n.message}</p>
                          <span className="gc-notif-time">
                            {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.read && (
                          <button
                            className="gc-notif-mark-btn"
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Tag */}
          <div className="gc-nav-user-tag">
            <div className="gc-user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="gc-user-info-text">
              <span className="gc-user-name">{user.name}</span>
              <span className="gc-user-role-badge">{user.role}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button className="gc-nav-logout-btn" onClick={handleLogout} title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="gc-logout-text">Logout</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            className="gc-nav-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="gc-mobile-drawer">
          <div className="gc-mobile-user">
            <div className="gc-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
            <div>
              <div className="gc-user-name">{user.name}</div>
              <div className="gc-user-role-badge">{user.role}</div>
            </div>
          </div>

          {user.role === 'USER' && (
            <div className="gc-mobile-points" onClick={() => { navigate('/reward-store'); setMobileMenuOpen(false); }}>
              <span>🏆 Points Balance</span>
              <strong>{user.rewardPoints ?? 0} Pts</strong>
            </div>
          )}

          <div className="gc-mobile-links">
            {user.role === 'USER' && (
              <>
                <button
                  className={`gc-mobile-link ${location.pathname === '/user-dashboard' ? 'active' : ''}`}
                  onClick={() => { navigate('/user-dashboard'); setMobileMenuOpen(false); }}
                >
                  Dashboard
                </button>
                <button
                  className={`gc-mobile-link ${location.pathname === '/reward-store' ? 'active' : ''}`}
                  onClick={() => { navigate('/reward-store'); setMobileMenuOpen(false); }}
                >
                  Reward Store
                </button>
              </>
            )}

            {user.role === 'OFFICE' && (
              <button
                className="gc-mobile-link active"
                onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
              >
                Office Console
              </button>
            )}

            {user.role === 'SUPER_ADMIN' && user.email?.toLowerCase() === 'sri741815@gmail.com' && (
              <>
                <button
                  className="gc-mobile-link"
                  onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                >
                  Global Analytics
                </button>
                <button
                  className="gc-mobile-link"
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                >
                  Office Registry
                </button>
              </>
            )}

            <button
              className="gc-mobile-link gc-mobile-logout"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default GlassNavbar;
