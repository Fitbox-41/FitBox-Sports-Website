import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductPage.css';
import axios from 'axios';
import CheckoutModal from '../components/CheckoutModal';
import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
const MobileRelatedRow = ({ products }) => {
  const [idx, setIdx] = useState(products.length);
  const [trans, setTrans] = useState(true);
  const [busy, setBusy] = useState(false);

  const next = () => {
    if (busy) return;
    setBusy(true);
    setIdx((p) => p + 1);
    setTimeout(() => setBusy(false), 550);
  };
  const prev = () => {
    if (busy) return;
    setBusy(true);
    setIdx((p) => p - 1);
    setTimeout(() => setBusy(false), 550);
  };

  useEffect(() => {
    if (idx >= products.length * 2) {
      setTimeout(() => { setTrans(false); setIdx(products.length); }, 500);
    }
    if (idx < products.length) {
      setTimeout(() => { setTrans(false); setIdx(products.length * 2 - 1); }, 500);
    }
  }, [idx, products.length]);

  useEffect(() => {
    if (!trans) {
      const timer = setTimeout(() => setTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [trans]);

  const startX = useRef(0);
  const handleTouchStart = (e) => (startX.current = e.touches[0].pageX);
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (startX.current - endX > 50) next();
    if (endX - startX.current > 50) prev();
  };

  return (
    <div className="v2-mobile-row-wrapper">
      <div
        className="v2-carousel-track-simple"
        style={{
          transform: `translateX(calc(-${idx} * 46%))`,
          transition: trans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          display: 'flex',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {[...products, ...products, ...products].map((rp, i) => (
          <div className="v2-mobile-carousel-item" key={`${rp.id}-${i}`} style={{ flex: '0 0 46%', padding: '0 6px', boxSizing: 'border-box' }}>
            <Link to={`/product/${rp.id}`} className="v2-product-card-link">
              <div className="v2-product-card">
                <div className="card-img-wrap">
                  <img src={rp.image} alt={rp.name} loading="lazy" decoding="async" />
                </div>
                <div className="card-info">
                  <h4 className="card-title">{rp.name}</h4>
                  <div className="card-pricing">
                    <span className="price-now">₹{rp.price}</span>
                    <span className="price-was">₹{rp.oldPrice}</span>
                  </div>
                  <p className="card-discount">{Math.round((1 - rp.price / rp.oldPrice) * 100)}% OFF</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductPage() {
  const { products: allProducts, loading } = useContext(ProductContext);
  // ─── 1. State & Data Logic ───
  const { addToCart } = useCart();
  const { currentUser, setShowLoginModal } = useAuth();
  const { deliveryFee } = useSettings();
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [buyNowDeliveryFee, setBuyNowDeliveryFee] = useState(0);
  // useParams retrieves the :productId from the URL (e.g., /product/1)
  const { productId } = useParams();

  // Local state for the current product data
  const [product, setProduct] = useState(null);

  const normalizeSizeLabel = (size) => {
    if (size === null || size === undefined) return '';
    if (typeof size === 'string') {
      return size.trim() || 'STANDARD';
    }
    if (typeof size === 'number') {
      return size > 0 ? String(size) : 'STANDARD';
    }
    if (typeof size === 'object') {
      const normalized = (size.name || size.label || `${size.price ? `₹${size.price}` : ''}`).trim();
      return normalized || 'STANDARD';
    }
    return 'STANDARD';
  };

  const normalizeVariantLabel = (variant) => {
    if (!variant) return '';
    if (typeof variant === 'string') return variant;
    if (typeof variant === 'object') {
      return variant.color || variant.name || variant.label || variant._id?.toString() || '';
    }
    return String(variant);
  };

  // Interaction states: which variant (color), size, and image are currently active
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  useEffect(() => {
    // ─── a. Find Product ───
    const found = allProducts.find((p) => p.id === Number(productId));
    if (found) {
      setProduct(found);
    }
    // Scroll to top on page entry
    window.scrollTo(0, 0);
    setQuantity(1); // Reset quantity on product/variant change
  }, [productId, allProducts]);

  // UI states: active tab for details, and accordion toggle states
  const [activeTab, setActiveTab] = useState('features');
  const [acc1, setAcc1] = useState(window.innerWidth > 1024); // Accordion 1 starts open on desktop
  const [acc2, setAcc2] = useState(false);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // ─── 2. RELATED PRODUCTS LOGIC ───
  let relatedProducts = [];
  
  if (product?.relatedIds && product.relatedIds.length > 0) {
    // 1. Get the exact products the user manually specified in products.js
    relatedProducts = allProducts.filter(p => product.relatedIds.includes(p.id));
    
    // 2. If they specified fewer than 10, automatically fill the rest so the UI stays perfect
    if (relatedProducts.length < 10) {
      const extraProducts = allProducts.filter(p => p.id !== parseInt(productId) && !product.relatedIds.includes(p.id));
      relatedProducts = [...relatedProducts, ...extraProducts].slice(0, 10);
    }
  } else {
    // Fallback: just get 10 other products automatically
    relatedProducts = allProducts
      .filter(p => p.id !== parseInt(productId))
      .slice(0, 10);
  }

  relatedProducts = relatedProducts.map((p, index) => {
    const v = p.variants?.[0] || {};
    const s = v.sizes?.[0] || null;
    const price = s?.price ?? v.price ?? p.price ?? 0;
    const oldPrice = s?.oldPrice ?? v.oldPrice ?? p.oldPrice ?? 0;
    return {
      ...p,
      price,
      oldPrice,
      id: p.id,
      /* ── 3. RELATED PRODUCT THUMBNAILS ── */
      image: p.variants && p.variants[0] && p.variants[0].images ? p.variants[0].images[0] : p.imgSrc || p.image || ''
    };
  });

  const relatedChunks = [];
  for (let i = 0; i < relatedProducts.length; i += 5) {
    relatedChunks.push(relatedProducts.slice(i, i + 5));
  }

  const titleRef = useRef(null);

  // ─── 3. Data Loading Effect ───
  useEffect(() => {
    // Scroll reveal observer for the "You may also like" title
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    }, { threshold: 0.1 });

    if (titleRef.current) observer.observe(titleRef.current);

    // Clean up observer on component unmount
    return () => observer.disconnect();
  }, []);

  // ─── RECENTLY VIEWED LOGIC ───
  useEffect(() => {
    if (!productId) return;
    const currentId = parseInt(productId);
    
    // Retrieve array from localStorage
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Get the products to display (excluding the current one, top 4)
    const recentIds = viewed.filter(id => id !== currentId).slice(0, 4);
    const recentProducts = allProducts
      .filter(p => recentIds.includes(p.id))
      .map(p => {
        const v = p.variants?.[0] || {};
        const s = v.sizes?.[0] || null;
        const price = s?.price ?? v.price ?? p.price ?? 0;
        const oldPrice = s?.oldPrice ?? v.oldPrice ?? p.oldPrice ?? 0;
        return {
          ...p,
          price,
          oldPrice,
          image: p.variants && p.variants[0] && p.variants[0].images ? p.variants[0].images[0] : p.imgSrc || p.image || ''
        };
      });
    setRecentlyViewedProducts(recentProducts);

    // Update localStorage
    viewed = viewed.filter(id => id !== currentId);
    viewed.unshift(currentId);
    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  }, [productId]);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStart.current - touchEnd.current > 50) {
      handleNext();
    }
    if (touchStart.current - touchEnd.current < -50) {
      handlePrev();
    }
  };

  // ── 3. Early return AFTER all hooks ──
  if (loading || !product) return (
    <div className="product-loading-v2">
      <div className="loading-content">
        <div className="lottie-container-v2">
          <DotLottieReact
            src="https://lottie.host/23c83fda-09ea-4928-b899-8121bece22cd/WtC6KRywYf.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    </div>
  );

  // ─── 4. Derived State: Current variant data and handlers ───
  const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { images: [], sizes: [] };
  const images = currentVariant.images || [];
  const sizeOptions = Array.isArray(currentVariant.sizes) ? currentVariant.sizes : [];
  const normalizedSizeOptions = sizeOptions
    .map((size, idx) => ({ size, label: normalizeSizeLabel(size), idx }))
    .filter((item) => item.label);
  const showSizeSelector = normalizedSizeOptions.length > 1;
  const isActuallyOutOfStock = product.isOutOfStock || currentVariant.isOutOfStock;

  const handleNext = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);



  const handleBuyNow = async () => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!currentUser.addresses || currentUser.addresses.length === 0 || !currentUser.phone) {
      alert("Please complete your account details by adding a phone number and shipping address before buying.");
      navigate('/account');
      return;
    }

    try {
      const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { sizes: [] };
      const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;

      const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
      const activeWeight = currentSize?.weight ?? currentVariant?.weight ?? 0;

      const buyNowItem = {
        ...product,
        selectedVariant: normalizeVariantLabel(currentVariant),
        selectedSize: normalizeSizeLabel(currentSize),
        price: activePrice,
        weight: activeWeight,
        imgSrc: currentVariant?.images[0] || product.imgSrc,
        quantity: quantity
      };
      
      const subtotalAmount = activePrice * quantity;
      const shippingAmount = subtotalAmount > 999 || subtotalAmount === 0 ? 0 : deliveryFee;
      const totalAmount = subtotalAmount + shippingAmount;

      setCheckoutItems([buyNowItem]);
      setCheckoutTotal(totalAmount);
      setBuyNowDeliveryFee(shippingAmount);

      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${apiUrl}/api/orders/place`, { 
        items: [{
          ...buyNowItem,
          id: product._id
        }], 
        totalAmount 
      }, config);
      
      if (res.data.success) {
        setCurrentOrderId(res.data.orderId);
        setIsCheckoutModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout");
    }
  };

  return (
    <div className="product-page">
      <Header hideSubHeader={true} hideSaleRibbon={false} />
      {/* Spacer for fixed header (Main header + Sale ribbon = ~111px) */}
      <div className="header-spacer desktop-only-spacer" style={{ height: '111px' }} />

      <main className="product-main container">
        <div className="product-layout">

          {/* ──── LEFT SECTION: Image Gallery ──── */}
          <div className="product-gallery-v2">
            <div
              className="main-image-viewport"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button className="nav-arrow left-arrow" onClick={handlePrev}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              <div className="image-track" style={{ transform: `translateX(-${currentImgIdx * 100}%)` }}>
                {images.map((img, idx) => (
                  <div key={idx} className="gallery-main-img-wrap">
                    {/* Rendering MAIN PRODUCT IMAGES */}
                    <img src={img} alt={`${product.name} - ${idx}`} className="gallery-main-img" />
                  </div>
                ))}
              </div>

              <button className="nav-arrow right-arrow" onClick={handleNext}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            <div className="thumb-strip-v2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-item-v2 ${currentImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setCurrentImgIdx(idx)}
                >
                  <img src={img} alt="thumbnail" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>

          {/* ──── RIGHT SECTION: Product Details ──── */}
          <div className="product-info-v2">
            <div className="v2-breadcrumb" style={{ marginBottom: '12px', fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              {product.category && (
                <>
                  <span>&gt;</span>
                  <Link to={`/category/${product.category.trim().replace(/\s+/g, '-').toLowerCase()}`} style={{ color: '#666', textDecoration: 'none' }}>
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()}
                  </Link>
                </>
              )}
              {product.subCategory && (
                <>
                  <span>&gt;</span>
                  <Link to={`/category/${product.subCategory.trim().replace(/\s+/g, '-').toLowerCase()}`} style={{ color: '#666', textDecoration: 'none' }}>
                    {product.subCategory.charAt(0).toUpperCase() + product.subCategory.slice(1).toLowerCase()}
                  </Link>
                </>
              )}
            </div>
            <span className="v2-brand-tag">FitBox Sports </span>
            <h1 className="v2-product-title">
              {product.name}
              {(() => {
                const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { sizes: [] };
                const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;
                const colorStr = currentVariant?.color ? ` - ${normalizeVariantLabel(currentVariant)}` : '';
                const sizeStr = currentSize ? ` - ${normalizeSizeLabel(currentSize)}` : '';
                return `${colorStr}${sizeStr}`;
              })()}
              {product.isNew && (
                <span className="ml-3 inline-block px-3 py-1 bg-[#ff6b35] text-white text-[0.65rem] font-bold uppercase tracking-wider rounded-full align-middle">
                  New Arrival
                </span>
              )}
            </h1>
            <div className="v2-qualities">
              {product.qualities.map((q, i) => (
                <span key={i}>
                  {q}{i < product.qualities.length - 1 ? ' | ' : ''}
                </span>
              ))}
            </div>

            <div className="v2-price-box">
              {(() => {
                const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { sizes: [] };
                const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;
                const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
                const activeOldPrice = currentSize?.oldPrice ?? currentVariant?.oldPrice ?? product.oldPrice ?? 0;
                return (
                  <>
                    <span className="v2-current-price">₹{activePrice * quantity}</span>
                    <span className="v2-old-price">₹{activeOldPrice * quantity}</span>
                    <span className="v2-save-tag">You Saved ₹{(activeOldPrice - activePrice) * quantity}</span>
                  </>
                );
              })()}
            </div>

            {/* COLOR SELECTOR */}
            <div className="v2-selector-wrap">
              <p className="selector-label">Color: <strong>{currentVariant?.color}</strong></p>
              <div className="v2-color-grid">
                {product.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className={`color-pill ${selectedVariantIdx === idx ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedVariantIdx(idx);
                      setSelectedSizeIdx(0);
                      setCurrentImgIdx(0);
                    }}
                  >
                    <img src={variant.images[0]} alt={variant.color || `Color ${idx}`} />
                    {variant.price && variant.price !== product.price && (
                       <span style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>₹{variant.price}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            {showSizeSelector && (
              <div className="v2-selector-wrap">
                <p className="selector-label">Size</p>
                <div className="v2-size-grid">
                  {normalizedSizeOptions.map(({ size, label, idx }) => (
                    <div
                      key={idx}
                      className={`size-pill ${selectedSizeIdx === idx ? 'selected' : ''}`}
                      onClick={() => setSelectedSizeIdx(idx)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                      <span>{label}</span>
                      {size.price && size.price !== product.price && (
                        <span style={{ fontSize: '10px', opacity: 0.8 }}>₹{size.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="v2-selector-wrap">
              <p className="selector-label">Quantity</p>
              <div className="v2-qty-ribbon">
                <button 
                  className="qty-btn" 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* URGENCY MESSAGE / OUT OF STOCK */}
            {isActuallyOutOfStock ? (
              <div className="v2-urgency-banner v2-out-of-stock-banner">
                <div className="urgency-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ color: '#1a1a2e' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className="urgency-text" style={{ color: '#1a1a2e' }}>This variant is currently out of stock.</p>
              </div>
            ) : (
              <div className="v2-urgency-banner">
                <div className="urgency-icon-wrap">
                  <span className="blink-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ color: '#c53030' }}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </span>
                </div>
                <p className="urgency-text">Only 2 products left. Hurry!</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="v2-action-buttons">
              <button 
                className={`v2-btn v2-btn-cart ${isActuallyOutOfStock ? 'v2-btn--disabled' : ''}`}
                disabled={isActuallyOutOfStock}
                onClick={() => {
                  const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;
                  const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
                  const activeWeight = currentSize?.weight ?? currentVariant?.weight ?? 0;
                  
                  addToCart({
                    ...product,
                    selectedVariant: normalizeVariantLabel(currentVariant),
                    selectedSize: normalizeSizeLabel(currentSize),
                    price: activePrice,
                    weight: activeWeight,
                    imgSrc: currentVariant?.images[0] || product.imgSrc,
                    quantity: quantity
                  });
                }}
              >
                {isActuallyOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                className={`v2-btn v2-btn-buy ${isActuallyOutOfStock ? 'v2-btn--disabled' : ''}`}
                disabled={isActuallyOutOfStock}
                onClick={handleBuyNow}
              >
                {isActuallyOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
            </div>

            <div className="v2-description">
              <h3>About Product</h3>
              {product.features ? (
                <ul className="v2-features-list">
                  {product.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p>{product.aboutText || product.longDesc}</p>
              )}
            </div>
          </div> {/* End of product-info-v2 */}
        </div> {/* End of product-layout */}

      </main>

      {/* TABS SECTION - Outside main for true full-width */}
      <div className="v2-tabs-selector">
        <button
          className={`tab-round-btn ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Features
        </button>
        <button
          className={`tab-round-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews
        </button>
      </div>

      {/* TAB CONTENT - Outside main for true full-width */}
      {activeTab === 'features' && (
        <div className="v2-tab-content full-width-content">
          <div className="accordion-item">
            <button className="accordion-header" onClick={() => setAcc1(!acc1)}>
              <span>Description</span>
              <div className={`acc-symbol ${acc1 ? 'open' : ''}`}>
                {acc1 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </div>
            </button>
            {acc1 && (
              <div className="accordion-body">
                <p>{product.longDesc}</p>
              </div>
            )}
          </div>

          <div className="accordion-item">
            <button className="accordion-header" onClick={() => setAcc2(!acc2)}>
              <span>Material Used</span>
              <div className={`acc-symbol ${acc2 ? 'open' : ''}`}>
                {acc2 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
              </div>
            </button>
            {acc2 && (
              <div className="accordion-body">
                <p>{product.material || "High-grade premium components."}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="v2-tab-content centered-text">
          <p style={{ color: 'var(--text-mid)', marginTop: '20px', textAlign: 'center' }}>No reviews yet for this product.</p>
        </div>
      )}

      {/* PRODUCT SHOWCASE SECTION */}
      {product.showcaseImages && (
        <div className="v2-product-showcase">
          <div className="showcase-grid">
            {product.showcaseImages.map((img, idx) => (
              <div key={idx} className="showcase-item">
                <div className="square-frame">
                  {/* Rendering SHOWCASE/DESCRIPTION IMAGES */}
                  <img src={img} alt={`${product.name} showcase ${idx}`} loading="lazy" decoding="async" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YOU MAY ALSO LIKE SECTION */}
      <section className="v2-related-products">
        <div className="section-header">
          <h2 className="section-title scroll-reveal-title" ref={titleRef}>You may also like</h2>
        </div>

        {/* Desktop grid (only 4 items max) */}
        <div className="related-grid related-desktop">
          {relatedProducts.slice(0, 4).map(rp => (
            <Link key={rp.id} to={`/product/${rp.id}`} className="v2-product-card-link">
              <div className="v2-product-card">
                <div className="card-img-wrap">
                  {/* Rendering RELATED PRODUCT IMAGES */}
                  <img src={rp.image} alt={rp.name} loading="lazy" decoding="async" />
                </div>
                <div className="card-info">
                  <h4 className="card-title">{rp.name}</h4>
                  <div className="card-pricing">
                    <span className="price-now">₹{rp.price}</span>
                    <span className="price-was">₹{rp.oldPrice}</span>
                  </div>
                  <p className="card-discount">{Math.round((1 - rp.price / rp.oldPrice) * 100)}% OFF</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile multi-row swipers */}
        <div className="related-mobile-multi-rows">
          {relatedChunks.map((chunk, rowIdx) => (
            <MobileRelatedRow key={`related-row-${rowIdx}`} products={chunk} />
          ))}
        </div>
      </section>

      {/* RECENTLY VIEWED SECTION */}
      <section className="v2-recently-viewed" style={{ padding: '0 0 60px', background: '#fff', width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="section-header" style={{ width: '100%', padding: '0 20px', marginBottom: '20px' }}>
          <h2 className="section-title">Recently Viewed</h2>
        </div>
        {recentlyViewedProducts.length > 0 ? (
          <div className="related-grid" style={{ width: '100%' }}>
            {recentlyViewedProducts.map((rp, index) => (
              <Link key={rp.id} to={`/product/${rp.id}`} className={`v2-product-card-link ${index >= 2 ? 'hide-on-mobile' : ''}`}>
                <div className="v2-product-card">
                  <div className="card-img-wrap">
                    <img src={rp.image} alt={rp.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="card-info">
                    <h4 className="card-title">{rp.name}</h4>
                    <div className="card-pricing">
                      <span className="price-now">₹{rp.price}</span>
                      <span className="price-was">₹{rp.oldPrice}</span>
                    </div>
                    <p className="card-discount">{Math.round((1 - rp.price / rp.oldPrice) * 100)}% OFF</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-mid)', textAlign: 'center', width: '100%' }}>You haven't viewed any other products yet.</p>
        )}
      </section>

      <Footer />
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        orderId={currentOrderId}
        checkoutItems={checkoutItems}
        checkoutTotal={checkoutTotal}
        deliveryFee={buyNowDeliveryFee}
        onSuccess={(id) => {
          setIsCheckoutModalOpen(false);
          navigate('/orders');
        }}
      />
    </div>
  );
}
