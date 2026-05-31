import { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductContext } from '../context/ProductContext';
import './Header.css';

/* ── Categories for Sub-Header ── */
const categories = [
  { label: 'Weights & Dumbbells',    path: '/category/weights-and-dumbbells'   },
  { label: 'Workout Essentials',     path: '/category/workout-essentials'       },
  { label: 'Support & Protection',   path: '/category/support-and-protection'     },
  { label: 'Balls & Sports',         path: '/category/balls-and-sports'      },
  { label: 'Lifestyle & Accessories',path: '/category/lifestyle-and-accessories' },
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
    path: '/favourites',
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
];

export default function Header({ hideSubHeader = false, hideSaleRibbon = false }) {
  const location = useLocation();
  const shouldHideSubHeader = hideSubHeader || location.pathname !== '/';
  
  const [menuOpen, setMenuOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cart, wishlist, toggleWishlist } = useCart();
  const { products: allProducts } = useContext(ProductContext);
  const { currentUser, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const lastScrollPos = useRef(0);
  const ticking = useRef(false);
  const userRef                   = useRef(null);
  const searchRef                 = useRef(null);
  const mobileSearchRef           = useRef(null);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);

  // --- Search State & Logic ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setFocusedIndex(-1);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = allProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5);
    setSearchResults(results);
    setFocusedIndex(-1);
  }, [searchQuery, allProducts]);

  const handleKeyDown = (e) => {
    if (searchQuery.trim() === '') return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
        handleProductSelect(searchResults[focusedIndex].id);
      } else if (searchResults.length > 0) {
        handleProductSelect(searchResults[0].id);
      }
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  const handleProductSelect = (id) => {
    navigate(`/product/${id}`);
    setSearchQuery('');
    setIsSearchOpen(false);
    setMenuOpen(false);
  };

  /* Scroll event listener to hide/show sub-header */
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);

  useEffect(() => {
    const updateScrollDir = () => {
      const currentScrollPos = window.scrollY;
      const delta = currentScrollPos - lastScrollPos.current;
      const threshold = 15; 
      
      // Show header search only after scrolling down a bit
      if (currentScrollPos > 150) {
        setShowHeaderSearch(true);
      } else {
        setShowHeaderSearch(false);
      }

      if (Math.abs(delta) > threshold) {
        if (delta > 0 && currentScrollPos > 50) {
          if (isScrollingUp) setIsScrollingUp(false);
        } else {
          if (!isScrollingUp) setIsScrollingUp(true);
        }
        lastScrollPos.current = currentScrollPos;
      }
      
      if (currentScrollPos <= 0) {
        if (!isScrollingUp) setIsScrollingUp(true);
        lastScrollPos.current = 0;
      }
      
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDir);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingUp]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  /* Close user & search dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  return (
    <header className={`header-container ${(isScrollingUp || menuOpen) ? 'is-scrolling-up' : 'is-scrolling-down'}`} id="header">
      <div className="header-top">
        <div className="header-inner">

          <Link to="/" className="logo" id="logo-link" onClick={() => setMenuOpen(false)}>
            <picture>
              <source media="(max-width: 900px)" srcSet="/fitbox-_red-white.webp" />
              <img src="/fitbox-_logo.-2-blackpng.webp" alt="FitBox Sports" className="header-logo-img" />
            </picture>
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
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4.5" width="4" height="4" rx="1" fill="currentColor"/>
                <rect x="3" y="10.5" width="4" height="4" rx="1" fill="currentColor"/>
                <rect x="3" y="16.5" width="4" height="4" rx="1" fill="currentColor"/>
                <rect x="9" y="5.5" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="9" y="11.5" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="9" y="17.5" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            )}
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
                  <input 
                    type="text" 
                    placeholder="Search for products..." 
                    autoFocus 
                    className="overlay-search-input" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="overlay-search-btn">Search</button>
                </div>
                {searchQuery.trim().length > 0 && (
                  <div className="search-dropdown-results">
                    {searchResults.length > 0 ? (
                      searchResults.map((p, idx) => {
                        const img = p.image || p.imgSrc || (p.variants && p.variants[0].images[0]);
                        return (
                          <div 
                            key={p.id} 
                            className={`search-result-item ${idx === focusedIndex ? 'focused' : ''}`}
                            onClick={() => handleProductSelect(p.id)}
                            onMouseEnter={() => setFocusedIndex(idx)}
                          >
                            <img src={img} alt={p.name} className="search-result-img" />
                            <div className="search-result-info">
                              <h5 className="search-result-title">{p.name}</h5>
                              <span className="search-result-price">₹{String(p.price).replace(/[^0-9,.]/g, '')}</span>
                            </div>
                            <button 
                              className={`search-result-fav-btn ${wishlist.some(w => w.id === p.id) ? 'active' : ''}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(p);
                              }}
                              aria-label="Add to wishlist"
                            >
                              <svg 
                                viewBox="0 0 24 24" 
                                fill={wishlist.some(w => w.id === p.id) ? '#ff416c' : 'none'} 
                                stroke={wishlist.some(w => w.id === p.id) ? '#ff416c' : 'currentColor'} 
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="search-result-empty">
                        <p>No matching product</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User icon with click dropdown */}
          <div
            ref={userRef}
            className="user-wrap"
            id="user-icon-wrap"
          >
            {currentUser ? (
              <button 
                className="icon-btn" 
                id="user-btn" 
                aria-label="User menu"
                onClick={() => setUserOpen(!userOpen)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </button>
            ) : (
              <Link to="/auth" className="icon-btn" id="user-btn" aria-label="Login">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </Link>
            )}

            {userOpen && currentUser && (
              <div className="user-dropdown" id="user-dropdown">
                {/* Dropdown header */}
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}</div>
                  <div>
                    <p className="dropdown-name">My Account</p>
                    <p className="dropdown-email">{currentUser.email || 'user@fitbox.com'}</p>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* Menu items */}
                {userMenuItems.map((item) => {
                  if (item.label === 'Switch Accounts') {
                    return (
                      <button
                        key={item.label}
                        className="dropdown-item"
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                        onClick={async () => {
                          setUserOpen(false);
                          await logout();
                          try {
                            await loginWithGoogle();
                            navigate('/');
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        <span className="dropdown-item-icon">{item.icon}</span>
                        {item.label}
                      </button>
                    );
                  }
                  
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="dropdown-item"
                      id={`dropdown-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setUserOpen(false)}
                    >
                      <span className="dropdown-item-icon">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}

                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item" 
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', fontFamily: 'inherit', fontSize: 'inherit' }}
                  onClick={async () => {
                    setUserOpen(false);
                    await logout();
                    navigate('/');
                  }}
                >
                  <span className="dropdown-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </span>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Cart icon */}
          <Link to="/cart" className="icon-btn cart-btn" id="cart-btn" aria-label="Shopping cart" onClick={() => setMenuOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge" id="cart-badge">{cartCount}</span>
            )}
          </Link>

          {/* Favourites icon */}
          <Link to="/favourites" className="icon-btn fav-btn" id="fav-btn" aria-label="Favourites" onClick={() => setMenuOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlist.length > 0 && (
              <span className="cart-badge" id="fav-badge">{wishlist.length}</span>
            )}
          </Link>

        </div>
        </div>
      </div>

      {/* ── Sale Ribbon ── */}
      {!hideSaleRibbon && (
        <div className={`sale-ribbon ${!isScrollingUp ? 'sale-ribbon--hidden' : ''}`}>
          <div className="sale-ribbon-track">
            <div className="sale-content">
              <span className="sale-text">SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • </span>
              <span className="sale-text">SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • </span>
              <span className="sale-text">SUMMER SALE IS LIVE! GET UP TO 50% OFF ON ALL GYM EQUIPMENT • USE CODE: FIT50 • LIMITED TIME OFFER • FREE DELIVERY ON ORDERS ABOVE ₹999 • </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Search Ribbon (Drops with sale ribbon, conditionally visible) ── */}
      {!hideSaleRibbon && (
        <div 
          className={`mobile-search-ribbon ${!showHeaderSearch ? 'mobile-search-ribbon--hidden' : ''}`}
          ref={mobileSearchRef}
        >
          <div className="mobile-search-inner">
            <input 
              type="text" 
              placeholder="Search for products..." 
              className="mobile-search-input" 
              value={searchQuery}
              onFocus={() => setIsMobileSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsMobileSearchFocused(true);
              }}
              onKeyDown={handleKeyDown}
            />
            <button className="mobile-search-submit" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
          {searchQuery.trim().length > 0 && isMobileSearchFocused && (
            <div className="search-dropdown-results mobile-search-dropdown">
              {searchResults.length > 0 ? (
                searchResults.map((p, idx) => {
                  const img = p.image || p.imgSrc || (p.variants && p.variants[0].images[0]);
                  return (
                    <div 
                      key={p.id} 
                      className={`search-result-item ${idx === focusedIndex ? 'focused' : ''}`}
                      onClick={() => handleProductSelect(p.id)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      <img src={img} alt={p.name} className="search-result-img" />
                      <div className="search-result-info">
                        <h5 className="search-result-title">{p.name}</h5>
                        <span className="search-result-price">₹{String(p.price).replace(/[^0-9,.]/g, '')}</span>
                      </div>
                      <button 
                        className={`search-result-fav-btn ${wishlist.some(w => w.id === p.id) ? 'active' : ''}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p);
                        }}
                        aria-label="Add to wishlist"
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          fill={wishlist.some(w => w.id === p.id) ? '#ff416c' : 'none'} 
                          stroke={wishlist.some(w => w.id === p.id) ? '#ff416c' : 'currentColor'} 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="search-result-empty">
                  <p>No matching product</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Sub Header (Categories) ── */}
      {(!shouldHideSubHeader || menuOpen) && (
        <div className={`sub-header ${menuOpen ? 'sub-header--open' : ''} ${(!isScrollingUp && !menuOpen) ? 'sub-header--hidden' : ''}`}>
          <nav className="sub-header-nav">
            {categories.map((cat) => (
              <Link key={cat.path} to={cat.path} className="sub-header-link" onClick={() => setMenuOpen(false)}>
                {cat.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* ── Mobile Menu Backdrop ── */}
      <div 
        className={`mobile-menu-backdrop ${menuOpen ? 'mobile-menu-backdrop--open' : ''}`} 
        onClick={() => setMenuOpen(false)}
      />
    </header>
  );
}
