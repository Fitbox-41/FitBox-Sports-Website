import { useState, memo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

// Floating image fly animation utility
const animateFly = (startElement, targetSelector, imageSrc) => {
  if (!startElement || !imageSrc) return;

  const targetElement = document.querySelector(targetSelector);
  if (!targetElement) return;

  // Create flyer element
  const flyer = document.createElement('div');
  flyer.className = 'cart-flyer-item';
  flyer.style.position = 'fixed';
  flyer.style.zIndex = '999999';
  flyer.style.width = '100px'; /* Larger size */
  flyer.style.height = '100px'; /* Larger size */
  flyer.style.backgroundImage = `url(${imageSrc})`;
  flyer.style.backgroundSize = 'cover';
  flyer.style.backgroundPosition = 'center';
  flyer.style.borderRadius = '50%';
  flyer.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.5)';
  flyer.style.pointerEvents = 'none';

  // Get positions
  const startRect = startElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  // Set start position (centered on startElement)
  const startX = startRect.left + startRect.width / 2 - 50;
  const startY = startRect.top + startRect.height / 2 - 50;
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;

  document.body.appendChild(flyer);

  // Force layout reflow
  flyer.offsetWidth;

  // Animate to target (slower transition)
  flyer.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
  flyer.style.left = `${targetRect.left + targetRect.width / 2 - 20}px`;
  flyer.style.top = `${targetRect.top + targetRect.height / 2 - 20}px`;
  flyer.style.transform = 'scale(0.3)';
  flyer.style.opacity = '0.1';

  // Cleanup and shake header element
  setTimeout(() => {
    flyer.remove();
    targetElement.classList.add('pulse-pop');
    setTimeout(() => {
      targetElement.classList.remove('pulse-pop');
    }, 450);
  }, 1200);
};

const ProductCard = memo(({ product, showStatusTags = false }) => {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const { addToCart, toggleWishlist, wishlist } = useCart();
  
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);
  
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const getIcon = (text) => {
    const t = text.toLowerCase();
    
    // Protection / Shield / Security
    if (t.includes('safe') || t.includes('secure') || t.includes('protect')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      );
    }
    // Water / Leak / Sweat / Washable
    if (t.includes('leak') || t.includes('sweat') || t.includes('wash') || t.includes('water')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      );
    }
    // BPA Free / Eco / Natural / Leather / Willow / Wood
    if (t.includes('bpa') || t.includes('eco') || t.includes('leather') || t.includes('willow') || t.includes('wood')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
        </svg>
      );
    }
    // Clean / Wash
    if (t.includes('clean')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
          <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
        </svg>
      );
    }
    // Fabric / Breathable / Wicking / Mesh
    if (t.includes('breathable') || t.includes('fabric') || t.includes('wicking') || t.includes('mesh')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
          <line x1="16" y1="8" x2="2" y2="22"></line>
          <line x1="17.5" y1="15" x2="9" y2="6.5"></line>
        </svg>
      );
    }
    // Support / Strap / Velcro / Fit / Adjustable / Tension
    if (t.includes('support') || t.includes('strap') || t.includes('velcro') || t.includes('fit') || t.includes('adjustable') || t.includes('tension')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      );
    }
    // Grip / Ergonomic / Slip
    if (t.includes('grip') || t.includes('ergonomic') || t.includes('slip') || t.includes('stitched')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"></path>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"></path>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
        </svg>
      );
    }
    // Weight / Heavy / Iron / Steel / Resistance
    if (t.includes('weight') || t.includes('heavy') || t.includes('iron') || t.includes('steel') || t.includes('resistance')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M6.5 6.5h11"></path>
          <path d="M6.5 17.5h11"></path>
          <path d="M6.5 6.5v11"></path>
          <path d="M17.5 6.5v11"></path>
          <path d="M3.5 9.5h3"></path>
          <path d="M17.5 9.5h3"></path>
          <path d="M3.5 14.5h3"></path>
          <path d="M17.5 14.5h3"></path>
          <path d="M9.5 6.5V3.5"></path>
          <path d="M14.5 6.5V3.5"></path>
          <path d="M9.5 20.5v-3"></path>
          <path d="M14.5 20.5v-3"></path>
        </svg>
      );
    }
    // Length / Size
    if (t.includes('length') || t.includes('size') || t.includes('50mm')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <line x1="21" y1="21" x2="3" y2="3"></line>
          <path d="M21 3l-6 0"></path>
          <path d="M21 3l0 6"></path>
          <path d="M3 21l6 0"></path>
          <path d="M3 21l0-6"></path>
        </svg>
      );
    }
    // Elastic / Rotation / Tangle / Ball / Edge
    if (t.includes('elastic') || t.includes('rotation') || t.includes('tangle') || t.includes('smooth') || t.includes('edge')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
        </svg>
      );
    }
    // Design / Hex / Shape / Face
    if (t.includes('design') || t.includes('hex') || t.includes('face') || t.includes('core')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2"></polygon>
        </svg>
      );
    }
    // Coating / Finish / Rubberized / Vinyl / Premium / Quality
    if (t.includes('coat') || t.includes('finish') || t.includes('rubber') || t.includes('vinyl') || t.includes('premium') || t.includes('quality') || t.includes('durable')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    // Base / Mount / Build
    if (t.includes('base') || t.includes('mount') || t.includes('build') || t.includes('sturdy')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M3 21h18"></path>
          <path d="M9 8h6v13H9z"></path>
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
        </svg>
      );
    }
    // Weather / Outdoor / Pick-up
    if (t.includes('weather') || t.includes('outdoor') || t.includes('pick')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5A4.502 4.502 0 0 0 17.584 10a6 6 0 1 0-11.168 0A4.502 4.502 0 0 0 2 14.5C2 16.985 4.015 19 6.5 19H17.5z"></path>
        </svg>
      );
    }
    
    // Default Checkmark
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
  };

  const showSkeleton = !imageLoaded && !!product.imgSrc;

  return (
    <div
      className="pc-card"
      id={`product-card-${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Skeleton overlay */}
      {showSkeleton && (
        <div className="pc-skeleton-overlay">
          <div className="pc-skeleton-img"></div>
          <div className="pc-skeleton-content">
            <div className="pc-skeleton-line title"></div>
            <div className="pc-skeleton-line desc"></div>
            <div className="pc-skeleton-line desc short"></div>
            <div className="pc-skeleton-price"></div>
            <div className="pc-skeleton-btn"></div>
          </div>
        </div>
      )}

      {/* Actual Content (Hidden until image loads) */}
      <div style={{ opacity: showSkeleton ? 0 : 1, transition: 'opacity 0.3s ease', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Badge */}
        {product.tag && (
          <span className="pc-badge" id={`pc-badge-${product.id}`}>
            {product.tag}
          </span>
        )}

        {/* Wishlist heart button */}
        <button
          className={`pc-wish ${isInWishlist ? 'pc-wish--active' : ''}`}
          id={`pc-wish-${product.id}`}
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!isInWishlist) {
              animateFly(e.currentTarget, '#fav-btn', product.imgSrc);
            }
            toggleWishlist(product);
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={isInWishlist ? '#ef4444' : 'none'}
            stroke={isInWishlist ? '#ef4444' : '#888'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Status Tags (Always show if out of stock or new) */}
        {(showStatusTags || product.isOutOfStock || product.isNew) && (
          <div className="pc-status-tags">
            {product.isOutOfStock ? (
              <span className="pc-status-tag pc-status-tag--out-of-stock">
                Out of Stock
              </span>
            ) : product.isNew ? (
              <span className="pc-status-tag pc-status-tag--new">
                New Arrival
              </span>
            ) : null}
          </div>
        )}

        {/* Image area */}
        <Link 
          to={`/product/${product.id}`} 
          className="pc-img-link" 
          id={`pc-img-${product.id}`}
        >
          {product.imgSrc ? (
              <img
                ref={imageRef}
                src={hovered && product.hoverImgSrc ? product.hoverImgSrc : product.imgSrc}
                alt={product.name}
                className={`pc-img ${product.isOutOfStock ? 'pc-img--out-of-stock' : ''}`}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
          ) : (
            <div className={`pc-placeholder ${hovered ? 'pc-placeholder--hover' : ''}`}>
              <div className="pc-placeholder-label">
                {hovered ? 'Hover View' : product.name}
              </div>
              <div className="pc-placeholder-hint">
                {hovered ? (product.desc || 'Quality Sports Gear') : 'Add image'}
              </div>
            </div>
          )}
        </Link>

        {/* Card body */}
        <div className="pc-body">
        <Link 
          to={`/product/${product.id}`} 
          className="pc-name"
        >
          {product.name}
        </Link>
        <div className="pc-qualities">
          {(product.qualities && product.qualities.length > 0 
            ? product.qualities 
            : ['Premium Quality', 'Highly Durable', 'Fitness Grade']
          ).slice(0, 3).map((q, idx) => {
            const text = q.trim();
            const parts = text.split(':');
            return (
              <span key={idx} className="pc-quality-sq">
                <span className="pc-quality-icon">{getIcon(text)}</span>
                <span className="pc-quality-text">
                  {parts.length > 1 ? (
                    <><strong>{parts[0].trim()}</strong> : {parts.slice(1).join(':').trim()}</>
                  ) : (
                    text
                  )}
                </span>
              </span>
            );
          })}
        </div>

        <div className="pc-price-row">
          {(() => {
            let minP = Number.POSITIVE_INFINITY;
            let maxP = 0;
            let uniqueWeights = new Set();
            const isFlattened = product.hasOwnProperty('selectedVariant');

            if (isFlattened) {
              minP = product.price || 0;
              maxP = product.price || 0;
              if (product.size && typeof product.size.weight === 'number' && product.size.weight > 0) {
                uniqueWeights.add(product.size.weight);
              } else if (product.variant && typeof product.variant.weight === 'number' && product.variant.weight > 0) {
                uniqueWeights.add(product.variant.weight);
              } else if (product.weight && product.weight > 0) {
                uniqueWeights.add(product.weight);
              }
            } else if (product.variants) {
              product.variants.forEach(v => {
                if (v.sizes && v.sizes.length) {
                  v.sizes.forEach(s => {
                    if (typeof s.price === 'number') {
                      if (s.price < minP) minP = s.price;
                      if (s.price > maxP) maxP = s.price;
                    }
                    if (typeof s.weight === 'number' && s.weight > 0) {
                      uniqueWeights.add(s.weight);
                    }
                  });
                } else if (typeof v.price === 'number') {
                  if (v.price < minP) minP = v.price;
                  if (v.price > maxP) maxP = v.price;
                  if (typeof v.weight === 'number' && v.weight > 0) {
                    uniqueWeights.add(v.weight);
                  }
                }
              });
            }

            if (!isFinite(minP)) minP = product.price || 0;
            if (maxP === 0) maxP = product.price || 0;
            const hasRange = minP !== maxP;

            if (uniqueWeights.size === 0 && product.weight && product.weight > 0) {
              uniqueWeights.add(product.weight);
            }

            let weightStr = '';
            if (uniqueWeights.size > 0) {
              const sortedWeights = Array.from(uniqueWeights).sort((a, b) => a - b);
              weightStr = sortedWeights.map(w => `${w / 1000} kg`).join(', ');
            }

            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pc-price">
                    {hasRange ? 'From ' : ''}₹{minP.toLocaleString('en-IN')}
                  </span>
                  {product.oldPrice && !hasRange && (
                    <span className="pc-old-price">₹{product.oldPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                {weightStr && (
                  <span className="pc-weight" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#666', fontWeight: '500' }}>
                    {weightStr}
                  </span>
                )}
              </>
            );
          })()}
        </div>

        <button 
          className={`pc-add-btn ${product.isOutOfStock ? 'pc-add-btn--disabled' : ''}`} 
          id={`pc-add-${product.id}`}
          disabled={product.isOutOfStock}
          onClick={(e) => {
            e.preventDefault();
            if (!product.isOutOfStock) {
              const currentVariant = (product.variants && product.variants[0]) || { sizes: [] };
              const currentSize = currentVariant?.sizes && currentVariant.sizes[0] ? currentVariant.sizes[0] : null;
              const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
              const activeWeight = currentSize?.weight ?? currentVariant?.weight ?? 0;
              
              const imgToFly = currentVariant?.images?.[0] || product.imgSrc;
              animateFly(e.currentTarget, '#cart-btn', imgToFly);
              
              const normalizeSizeLabel = (size) => {
                if (size === null || size === undefined) return '';
                if (typeof size === 'string') return size.trim() || 'STANDARD';
                if (typeof size === 'number') return size > 0 ? String(size) : 'STANDARD';
                if (typeof size === 'object') return (size.name || size.label || (size.price ? `₹${size.price}` : '')).trim() || 'STANDARD';
                return 'STANDARD';
              };
              
              const normalizeVariantLabel = (variant) => {
                if (!variant) return '';
                if (typeof variant === 'string') return variant;
                if (typeof variant === 'object') return variant.color || variant.name || variant.label || variant._id?.toString() || '';
                return String(variant);
              };

              addToCart({
                ...product,
                selectedVariant: normalizeVariantLabel(currentVariant),
                selectedSize: normalizeSizeLabel(currentSize),
                price: activePrice,
                weight: activeWeight,
                imgSrc: currentVariant?.images?.[0] || product.imgSrc,
                quantity: 1
              });
            }
          }}
        >
          {product.isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
      </div>
    </div>
  );
});

export default ProductCard;
