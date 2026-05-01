import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import MobileNav from './components/MobileNav';
import './index.css';

function App() {
  return (
    <BrowserRouter>
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
