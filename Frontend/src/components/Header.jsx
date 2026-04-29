import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/* ── Categories for Sub-Header ── */
const categories = [
  { label: 'Weights & Dumbbells',    path: '/dumbbells'   },
  { label: 'Balls & Sports',      path: '/balls'       },
  { label: 'Home Gym & Sets',   path: '/homegym'     },
  { label: 'Boxing & Belts',     path: '/boxing'      },
  { label: 'Wearable & Accessories',   path: '/accessories' },
];

/* ── User dropdown menu items (SVG icons, no emojis) ── */
const userMenuItems = [
  {
    label: 'Your Account',
    path: '/account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: 'Your Orders',
    path: '/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M9 17H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-4" />
        <rect x="9" y="3" width="6" height="14" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Your Wish List',
    path: '/wishlist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'Switch Accounts',
    path: '/switch',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    label: 'Sign Out',
    path: '/signout',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount]               = useState(3);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollPos, setLastScrollPos] = useState(0);
  const userRef                   = useRef(null);
  const searchRef                 = useRef(null);

  /* Scroll event listener to hide/show sub-header */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // If we scroll down and are not at the very top, hide sub-header
      if (currentScrollPos > lastScrollPos && currentScrollPos > 50) {
        setIsScrollingUp(false);
      } else {
        setIsScrollingUp(true);
      }
      
      setLastScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollPos]);

  /* Close user & search dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className={`header-container ${isScrollingUp ? 'is-scrolling-up' : 'is-scrolling-down'}`} id="header">
      <div className="header-top">
        <div className="header-inner">

          <Link to="/" className="logo" id="logo-link">
            <img src="/fitbox-_logo.-2-blackpng.png" alt="FitBox Sports" className="header-logo-img" />
          </Link>




        {/* ── Right: user + cart + hamburger ── */}
        <div className="header-actions">
          {/* ── Mobile hamburger ── */}
          <button
            id="hamburger-btn"
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>

          {/* Search Toggle Icon */}
          <div className="search-wrap" ref={searchRef}>
            <button 
              className={`icon-btn ${isSearchOpen ? 'active' : ''}`} 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {isSearchOpen && (
              <div className="header-search-overlay">
                <div className="search-overlay-inner">
                  <input type="text" placeholder="Search for products..." autoFocus className="overlay-search-input" />
                  <button className="overlay-search-btn">Search</button>
                </div>
              </div>
            )}
          </div>

          {/* User icon with hover dropdown */}
          <div
            ref={userRef}
            className="user-wrap"
            id="user-icon-wrap"
            onMouseEnter={() => setUserOpen(true)}
            onMouseLeave={() => setUserOpen(false)}
          >
            <button className="icon-btn" id="user-btn" aria-label="User menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </button>

            {userOpen && (
              <div className="user-dropdown" id="user-dropdown">
                {/* Dropdown header */}
                <div className="dropdown-header">
                  <div className="dropdown-avatar">U</div>
                  <div>
                    <p className="dropdown-name">My Account</p>
                    <p className="dropdown-email">user@fitbox.com</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* Menu items */}
                {userMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className="dropdown-item"
                    id={`dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="dropdown-item-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cart icon */}
          <Link to="/cart" className="icon-btn cart-btn" id="cart-btn" aria-label="Shopping cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge" id="cart-badge">{cartCount}</span>
            )}
          </Link>

          {/* Customer Support Icon */}
          <Link to="/support" className="icon-btn support-btn" id="support-btn" aria-label="Customer Support">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </Link>

        </div>
        </div>
      </div>

      {/* ── Sale Ribbon ── */}
      <div className={`sale-ribbon ${!isScrollingUp ? 'sale-ribbon--hidden' : ''}`}>
        <div className="sale-ribbon-track">
          <div className="sale-content">
            <span className="sale-text">SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • </span>
            <span className="sale-text">SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • </span>
            <span className="sale-text">SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • </span>
          </div>
        </div>
      </div>

      {/* ── Mobile Search Ribbon (Drops with sale ribbon) ── */}
      <div className="mobile-search-ribbon">
        <div className="mobile-search-inner">
          <input 
            type="text" 
            placeholder="Search for products..." 
            className="mobile-search-input" 
          />
          <button className="mobile-search-submit" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sub Header (Categories) ── */}
      <div className={`sub-header ${menuOpen ? 'sub-header--open' : ''} ${!isScrollingUp ? 'sub-header--hidden' : ''}`}>
        <nav className="sub-header-nav">
          {categories.map((cat) => (
            <Link key={cat.path} to={cat.path} className="sub-header-link" onClick={() => setMenuOpen(false)}>
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
