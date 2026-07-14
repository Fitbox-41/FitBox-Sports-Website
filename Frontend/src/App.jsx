import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect, useContext, useState } from 'react';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import ProductCategory from './pages/ProductCategory';
import Under99 from './pages/Under99';
import Cart from './pages/Cart';
import Favourite from './pages/Favourite';
import Auth from './pages/Auth';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Contact from './pages/Contact';
import About from './pages/About';
import Team from './pages/Team';
import FAQ from './pages/FAQ';
import Sitemap from './pages/Sitemap';
import Account from './pages/Account';
import Orders from './pages/Orders';
import CODGateway from './pages/CODGateway';
import MobileNav from './components/MobileNav';
import { CartProvider } from './context/CartContext';
import { ProductProvider, ProductContext } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import Loader from './components/Loader';
import LoginRequiredModal from './components/LoginRequiredModal';
import './index.css';

// Scroll Management Component
function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') {
      const savedPos = sessionStorage.getItem(`scrollPos-${pathname}`);
      if (savedPos) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPos, 10));
        }, 10);
        return;
      }
    }
    
    // Default: scroll to top on new navigation
    window.scrollTo(0, 0);
  }, [pathname, navType]);

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
    // Hide the loader as soon as data finishes loading naturally (no artificial delay)
    if (!loading) {
      setShowLoader(false);
      // Brief delay for the fade out transition before animations start
      const timer = setTimeout(() => {
          window.__APP_LOADED__ = true;
          window.dispatchEvent(new CustomEvent('loaderFinished'));
      }, 400);
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
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/cod-checkout/:orderId" element={<CODGateway />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/under99" element={<Under99 />} />
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
      <SettingsProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
