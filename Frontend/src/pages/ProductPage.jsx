import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductPage.css';

// Extended Mock Data with Color Blocks instead of Images
const allProducts = [
  { 
    id: 1, 
    name: 'Pro Hex Dumbbell Set', 
    price: 2499, 
    oldPrice: 3200, 
    qualities: ['Rubber-coated', 'Anti-roll', 'Premium Quality'],
    variants: [
      {
        color: 'Onyx Black',
        hex: '#1a1a1a',
        images: ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a', '#000000']
      },
      {
        color: 'Electric Blue',
        hex: '#3b82f6',
        images: ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1e40af']
      },
      {
        color: 'Crimson Red',
        hex: '#ef4444',
        images: ['#ef4444', '#f87171', '#dc2626', '#b91c1c', '#991b1b']
      }
    ],
    sizes: ['5kg', '10kg', '15kg'],
    longDesc: 'Our Pro Hex Dumbbells are designed for maximum durability and comfort. The hexagonal shape prevents rolling, while the rubber coating protects your floors and reduces noise.',
    material: 'Cast Iron with Premium Rubber Coating'
  },
  {
    id: 2,
    name: 'Official Match Basketball',
    price: 1799,
    oldPrice: 2400,
    qualities: ['Superior Grip', 'Official Size', 'Indoor/Outdoor'],
    variants: [
      {
        color: 'Classic Orange',
        hex: '#f97316',
        images: ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#c2410c']
      },
      {
        color: 'Pro Brown',
        hex: '#78350f',
        images: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b']
      },
      {
        color: 'Neon Yellow',
        hex: '#eab308',
        images: ['#eab308', '#facc15', '#fef08a', '#ca8a04', '#a16207']
      }
    ],
    sizes: ['Size 5', 'Size 6', 'Size 7'],
    longDesc: 'Engineered for consistent bounce and exceptional grip, our Official Match Basketball is the perfect choice for both indoor courts and outdoor play.',
    material: 'Composite Leather & Natural Rubber'
  },
  {
    id: 3,
    name: 'Shaker Pro 700ml',
    price: 499,
    oldPrice: 699,
    qualities: ['BPA-Free', 'Leak-Proof', 'High-Grade Plastic'],
    variants: [
      {
        color: 'Smoke Black',
        hex: '#111827',
        images: ['#111827', '#1f2937', '#374151', '#4b5563', '#000000']
      },
      {
        color: 'Crystal Clear',
        hex: '#f3f4f6',
        images: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#ffffff']
      },
      {
        color: 'Royal Blue',
        hex: '#1d4ed8',
        images: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#1e3a8a']
      }
    ],
    sizes: ['500ml', '700ml'],
    longDesc: 'The Supplements Shaker Bottle is a premium-quality gym and fitness accessory designed for athletes, bodybuilders, and fitness enthusiasts. Specially crafted to mix protein powders, supplements, and nutrition shakes effortlessly, this shaker bottle ensures you get a smooth, lump-free drink every time. Made from high-grade, BPA-free, and non-toxic plastic, it is safe, durable, and built for everyday use. With its ergonomic design and leak-proof lid, you can confidently carry it in your gym bag, backpack, or while traveling without worrying about spills. The shaker comes with a powerful mixing mechanism (whisk ball or built-in blender design) that allows quick blending of protein, pre-workout, or post-workout supplements, ensuring maximum nutrient absorption. Its lightweight yet sturdy construction makes it perfect for daily workouts, running, cycling, yoga, and other sports activities. The bottle is also easy to clean and maintain, making it a reliable companion for your fitness journey. Designed with a comfortable grip and wide-mouth opening, it allows easy filling, pouring, and cleaning. Whether you need to mix protein shakes, BCAAs, creatine, or meal replacements, this shaker bottle is a must-have for every fitness-conscious individual.add ',
    material: 'BPA-Free High-Grade Polypropylene',
    features: [
      'Premium Quality Shaker Bottle – Designed for athletes, bodybuilders, and fitness enthusiasts for daily gym and workout use',
      'Smooth & Lump-Free Mixing – Efficient mixing mechanism ensures quick and even blending of protein powders and supplements',
      'BPA-Free & Non-Toxic Material – Made from high-grade plastic that is safe, durable, and suitable for everyday use',
      'Leak-Proof & Secure Lid – Prevents spills and mess, making it ideal for gym bags, backpacks, and travel',
      'Ergonomic & Lightweight Design – Comfortable grip with sturdy construction for easy handling during workouts',
      'Wide Mouth Opening – Allows easy filling, pouring, and hassle-free cleaning'
    ]
  }
];

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('features');
  const [acc1, setAcc1] = useState(window.innerWidth > 1024);
  const [acc2, setAcc2] = useState(false);

  const relatedProducts = [
    { id: 101, name: "Women's Blue Printed Sport Bra", price: 979, oldPrice: 2799, image: "/1-1.jpg" },
    { id: 102, name: "Pro Mesh Leggings Black", price: 1299, oldPrice: 2499, image: "/2-1.jpg" },
    { id: 103, name: "Active Seamless Tank", price: 749, oldPrice: 1499, image: "/3-1.jpg" },
    { id: 104, name: "Compression Core Shorts", price: 899, oldPrice: 1999, image: "/4-1.jpg" }
  ];

  const titleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    }, { threshold: 0.1 });
    
    if (titleRef.current) observer.observe(titleRef.current);
    
    const found = allProducts.find(p => p.id === parseInt(productId));
    setProduct(found);

    return () => observer.disconnect();
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

  const currentVariant = product.variants[selectedVariantIdx];
  const images = currentVariant.images;

  const handleNext = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="product-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      
      <main className="product-main container">
        <div className="product-layout">
          
          {/* LEFT: GALLERY SECTION */}
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
                  <div key={idx} className="gallery-main-img-placeholder" style={{ backgroundColor: img }}></div>
                ))}
              </div>

              <button className="nav-arrow right-arrow" onClick={handleNext}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            <div className="thumb-strip-v2">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumb-v2 ${currentImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setCurrentImgIdx(idx)}
                >
                  <div className="thumb-color-square" style={{ backgroundColor: img }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: INFO SECTION */}
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
                <p>{product.longDesc}</p>
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
      <div className="v2-product-showcase">
        <div className="showcase-grid">
          <div className="showcase-item">
            <div className="square-frame">
              <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop" alt="Gym Workout" />
            </div>
          </div>
          <div className="showcase-item">
            <div className="square-frame">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop" alt="Sports Gear" />
            </div>
          </div>
          <div className="showcase-item">
            <div className="square-frame">
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" alt="Athlete Life" />
            </div>
          </div>
        </div>
      </div>

      {/* YOU MAY ALSO LIKE SECTION */}
      <section className="v2-related-products">
        <div className="section-header">
          <h2 className="section-title scroll-reveal-title" ref={titleRef}>You may also like</h2>
        </div>
        
        <div className="related-grid">
          {relatedProducts.map(rp => (
            <div key={rp.id} className="v2-product-card">
              <div className="card-img-wrap">
                <img src={rp.image} alt={rp.name} />
              </div>
              <div className="card-info">
                <h4 className="card-title">{rp.name}</h4>
                <div className="card-pricing">
                  <span className="price-now">₹{rp.price}</span>
                  <span className="price-was">₹{rp.oldPrice}</span>
                </div>
                <p className="card-discount">{Math.round((1 - rp.price/rp.oldPrice)*100)}% OFF</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
