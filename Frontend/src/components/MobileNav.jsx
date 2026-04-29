import { useNavigate, Link, useLocation } from 'react-router-dom';
import './MobileNav.css';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="mobile-nav">
      <button 
        className="mobile-nav-item" 
        onClick={() => navigate(-1)}
        aria-label="Back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`} onClick={handleHomeClick} aria-label="Home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      <a href="https://youtube.com" className="mobile-nav-item nav-999" aria-label="YouTube">
        <span className="text-999">99</span>
      </a>

      <a href="https://youtube.com" className="mobile-nav-item" aria-label="Account YouTube">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </a>

      <a href="https://youtube.com" className="mobile-nav-item nav-cart" aria-label="Cart YouTube">
        <div className="cart-icon-wrapper">
          <div className="cart-lines">
            <span className="line line-1"></span>
            <span className="line line-2"></span>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
             <circle cx="9" cy="21" r="1" />
             <circle cx="20" cy="21" r="1" />
             <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
      </a>
    </nav>
  );
};

export default MobileNav;
