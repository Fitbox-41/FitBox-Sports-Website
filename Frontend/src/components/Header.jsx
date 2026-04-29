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


export default function Header() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollPos, setLastScrollPos] = useState(0);
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
