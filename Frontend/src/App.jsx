import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { useEffect, useContext, useState, Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const ProductCategory = lazy(() => import('./pages/ProductCategory'));
const Under99 = lazy(() => import('./pages/Under99'));
const Cart = lazy(() => import('./pages/Cart'));
const Favourite = lazy(() => import('./pages/Favourite'));
const Auth = lazy(() => import('./pages/Auth'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Returns = lazy(() => import('./pages/Returns'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Team = lazy(() => import('./pages/Team'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Sitemap = lazy(() => import('./pages/Sitemap'));
const Account = lazy(() => import('./pages/Account'));
const Orders = lazy(() => import('./pages/Orders'));
const CODGateway = lazy(() => import('./pages/CODGateway'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
import MobileNav from './components/MobileNav';
import LoginPromptModal from './components/LoginPromptModal';
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
    // Hide the static loader from index.html as soon as data finishes loading
    if (!loading) {
      const staticLoader = document.getElementById('static-loader');
      if (staticLoader) {
        staticLoader.classList.add('hidden');
      }
      setShowLoader(false);
      // Brief delay for the fade out transition before animations start
      const timer = setTimeout(() => {
          if (staticLoader) {
            staticLoader.remove(); // Remove from DOM after fade out
          }
          window.__APP_LOADED__ = true;
          window.dispatchEvent(new CustomEvent('loaderFinished'));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>

      <BrowserRouter>
        <LoginPromptModal />
        <LoginRequiredModal />
        <ScrollToTop />
        <Suspense fallback={<Loader isVisible={true} showBar={false} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            
            <Route path="/cart" element={<Cart />} />
            <Route path="/favourites" element={<Favourite />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
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
        </Suspense>
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
