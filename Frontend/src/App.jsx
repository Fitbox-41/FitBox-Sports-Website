import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect, useContext, useState } from 'react';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProductCategory from './pages/ProductCategory';
import Cart from './pages/Cart';
import Favourite from './pages/Favourite';
import Auth from './pages/Auth';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Shipping from './pages/Shipping';
import MobileNav from './components/MobileNav';
import { CartProvider } from './context/CartContext';
import { ProductProvider, ProductContext } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Loader from './components/Loader';
import LoginRequiredModal from './components/LoginRequiredModal';
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

// Inner component to consume contexts safely
function AppContent() {
  const { loading } = useContext(ProductContext);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Ensure the loader stays for a very short time
      const timer = setTimeout(() => {
        setShowLoader(false);
        // Wait for the faster fade out transition (0.4s) before triggering animations
        setTimeout(() => {
            window.__APP_LOADED__ = true;
            window.dispatchEvent(new CustomEvent('loaderFinished'));
        }, 400);
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      <Loader isVisible={showLoader} />

      <BrowserRouter>
        <LoginRequiredModal />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          
          <Route path="/cart" element={<Cart />} />
          <Route path="/favourites" element={<Favourite />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Auth />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Shipping />} />
          <Route path="/under99" element={<Home />} />
          <Route path="/category/:categoryId" element={<ProductCategory />} />
          
          {/* Catch-all to home */}
          <Route path="*" element={<Home />} />
        </Routes>
        <MobileNav />
      </BrowserRouter>
      <SpeedInsights />
      <Analytics />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
