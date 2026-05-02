import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductPage.css';

import allProducts from '../data/products';


export default function ProductPage() {
  // ─── 1. State & Data Logic ───
  // useParams retrieves the :productId from the URL (e.g., /product/1)
  const { productId } = useParams();

  // Local state for the current product data
  const [product, setProduct] = useState(null);

  // Interaction states: which variant (color), size, and image are currently active
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // UI states: active tab for details, and accordion toggle states
  const [activeTab, setActiveTab] = useState('features');
  const [acc1, setAcc1] = useState(window.innerWidth > 1024); // Accordion 1 starts open on desktop
  const [acc2, setAcc2] = useState(false);

  // ─── 2. RELATED PRODUCTS LOGIC ───
  // Fetch specific products if relatedIds are provided, else fallback to category/first few
  let relatedProducts = [];
  if (product?.relatedIds) {
    relatedProducts = allProducts.filter(p => product.relatedIds.includes(p.id));
  } else {
    relatedProducts = allProducts
      .filter(p => p.id !== parseInt(productId))
      .slice(0, 4);
  }

  relatedProducts = relatedProducts.map(p => ({
    ...p,
    /* ── 3. RELATED PRODUCT THUMBNAILS ── */
    image: p.variants[0].images[0]
  }));

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

    // Find product data from mock array based on URL ID
    const found = allProducts.find(p => p.id === parseInt(productId));
    setProduct(found);

    // Clean up observer on component unmount
    return () => observer.disconnect();
  }, [productId, product]);

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
  if (!product) return (
    <div className="product-loading-v2">
      <div className="loading-content">
        <div className="lottie-container-v2">
          <DotLottieReact
            src="/Loading.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    </div>
  );

  // ─── 4. Derived State: Current variant data and handlers ───
  const currentVariant = product.variants[selectedVariantIdx];
  const images = currentVariant.images;

  const handleNext = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);

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
                  <img src={img} alt="thumbnail" />
                </button>
              ))}
            </div>
          </div>

          {/* ──── RIGHT SECTION: Product Details ──── */}
          <div className="product-info-v2">
            <h1 className="v2-product-title">{product.name}</h1>
            <div className="v2-qualities">
              {product.qualities.map((q, i) => (
                <span key={i}>
                  {q}{i < product.qualities.length - 1 ? ' | ' : ''}
                </span>
              ))}
            </div>

            <div className="v2-price-box">
              <span className="v2-current-price">₹{product.price}</span>
              <span className="v2-old-price">₹{product.oldPrice}</span>
              <span className="v2-save-tag">You Saved ₹{product.oldPrice - product.price}</span>
            </div>

            {/* COLOR SELECTOR */}
            <div className="v2-selector-wrap">
              <p className="selector-label">Color</p>
              <div className="v2-color-grid">
                {product.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className={`color-pill ${selectedVariantIdx === idx ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedVariantIdx(idx);
                      setCurrentImgIdx(0);
                    }}
                  >
                    <div className="color-swatch" style={{ backgroundColor: variant.hex }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div className="v2-selector-wrap">
              <p className="selector-label">Size</p>
              <div className="v2-size-grid">
                {product.sizes.map((size, idx) => (
                  <div
                    key={idx}
                    className={`size-pill ${selectedSizeIdx === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedSizeIdx(idx)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>

            {/* URGENCY MESSAGE */}
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

            {/* ACTION BUTTONS */}
            <div className="v2-action-buttons">
              <button className="v2-btn v2-btn-cart">Add to Cart</button>
              <button className="v2-btn v2-btn-buy">Buy Now</button>
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
                  <img src={img} alt={`${product.name} showcase ${idx}`} />
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

        <div className="related-grid">
          {relatedProducts.map(rp => (
            <Link key={rp.id} to={`/product/${rp.id}`} className="v2-product-card-link">
              <div className="v2-product-card">
                <div className="card-img-wrap">
                  {/* Rendering RELATED PRODUCT IMAGES */}
                  <img src={rp.image} alt={rp.name} />
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
      </section>

      <Footer />
    </div>
  );
}
