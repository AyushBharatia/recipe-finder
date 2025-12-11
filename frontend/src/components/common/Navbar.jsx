import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

// ===== Inline SVG Icons =====
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const dropdownRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Navigation items
  const navItems = [
    { to: '/recipes', label: 'Recipes', icon: BookIcon },
    ...(isAuthenticated ? [
      { to: '/recipes/new', label: 'Add Recipe', icon: PlusIcon },
      { to: '/favorites', label: 'Favorites', icon: HeartIcon },
    ] : []),
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__container">
          {/* Brand */}
          <Link to="/" className="navbar__brand">
            <svg className="navbar__brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
            Recipe Finder
          </Link>

          {/* Search - Centered */}
          <form className="navbar__search navbar__search--desktop" onSubmit={handleSearch}>
            <input
              type="text"
              className="navbar__search-input"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="navbar__search-btn" aria-label="Search">
              <SearchIcon />
            </button>
          </form>

          {/* Desktop Navigation */}
          <div className="navbar__desktop">
            {/* Nav Links */}
            <div className="navbar__nav">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `navbar__nav-link ${isActive ? 'navbar__nav-link--active' : ''}`
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="navbar__user" ref={dropdownRef}>
                <button
                  className="navbar__avatar-btn"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="navbar__avatar">
                    {getInitials(user?.name)}
                  </div>
                  <span className="navbar__avatar-name">{user?.name}</span>
                  <span className={`navbar__avatar-chevron ${isUserDropdownOpen ? 'navbar__avatar-chevron--open' : ''}`}>
                    <ChevronDownIcon />
                  </span>
                </button>

                <div className={`navbar__dropdown ${isUserDropdownOpen ? 'navbar__dropdown--open' : ''}`}>
                  <div className="navbar__dropdown-header">
                    <span className="navbar__dropdown-name">{user?.name}</span>
                    <span className="navbar__dropdown-email">{user?.email}</span>
                    {isAdmin() && (
                      <span className="navbar__dropdown-badge">Admin</span>
                    )}
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout}
                  >
                    <LogoutIcon />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar__auth">
                <Link to="/login" className="navbar__btn navbar__btn--ghost">
                  Login
                </Link>
                <Link to="/register" className="navbar__btn navbar__btn--primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <button
            className={`navbar__hamburger ${isMobileMenuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
            <span className="navbar__hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${isMobileMenuOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <div
          className="navbar__mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="navbar__mobile-panel">
          <div className="navbar__mobile-header">
            <span className="navbar__mobile-title">Menu</span>
            <button
              className="navbar__mobile-close"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="navbar__mobile-search">
            <form className="navbar__search" onSubmit={handleSearch}>
              <input
                type="text"
                className="navbar__search-input"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="navbar__search-btn" aria-label="Search">
                <SearchIcon />
              </button>
            </form>
          </div>

          {/* Mobile Nav */}
          <nav className="navbar__mobile-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `navbar__mobile-item ${isActive && location.pathname === '/' ? 'navbar__mobile-item--active' : ''}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HomeIcon />
              Home
            </NavLink>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `navbar__mobile-item ${isActive ? 'navbar__mobile-item--active' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Footer */}
          <div className="navbar__mobile-footer">
            {isAuthenticated ? (
              <>
                <div className="navbar__mobile-user">
                  <div className="navbar__avatar">
                    {getInitials(user?.name)}
                  </div>
                  <div className="navbar__mobile-user-info">
                    <span className="navbar__mobile-user-name">
                      {user?.name}
                      {isAdmin() && <span className="navbar__dropdown-badge" style={{ marginLeft: '8px' }}>Admin</span>}
                    </span>
                    <span className="navbar__mobile-user-email">{user?.email}</span>
                  </div>
                </div>
                <button className="navbar__mobile-logout" onClick={handleLogout}>
                  <LogoutIcon />
                  Logout
                </button>
              </>
            ) : (
              <div className="navbar__mobile-auth">
                <Link
                  to="/login"
                  className="navbar__btn navbar__btn--ghost"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="navbar__btn navbar__btn--primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
