import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import MobileNav from './components/MobileNav';
import './index.css';

// Scroll Management Component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const savedPos = sessionStorage.getItem(`scrollPos-${pathname}`);
    if (savedPos) {
      // Small delay to ensure content is painted
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPos, 10));
      }, 10);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    // 2. Track Scroll Position
    const handleScroll = () => {
      sessionStorage.setItem(`scrollPos-${window.location.pathname}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        
        <Route path="/cart" element={<Home />} />
        <Route path="/account" element={<Home />} />
        <Route path="/under99" element={<Home />} />
        
        {/* Catch-all to home */}
        <Route path="*" element={<Home />} />
      </Routes>
      <MobileNav />
    </BrowserRouter>
  );
}

export default App;
