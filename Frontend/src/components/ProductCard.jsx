import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = memo(({ product }) => {
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);

  const getIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('weight') || t.includes('kg') || t.includes('heavy') || t.includes('iron')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M10 5a2 2 0 0 1 4 0" />
          <path d="M8 7h8l2 12H6z" />
          <circle cx="12" cy="14" r="2.5" />
        </svg>
      );
    }
    if (t.includes('speed') || t.includes('km')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <circle cx="16" cy="12" r="6" />
          <path d="M16 12l-2-2" />
          <line x1="2" y1="12" x2="8" y2="12" />
          <line x1="4" y1="8" x2="8" y2="8" />
          <line x1="4" y1="16" x2="8" y2="16" />
        </svg>
      );
    }
    if (t.includes('motor') || t.includes('hp') || t.includes('power')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <circle cx="12" cy="12" r="7" />
          <path d="M13 8l-2 4h3l-2 4" />
          <line x1="1" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="23" y2="12" />
        </svg>
      );
    }
    if (t.includes('finish') || t.includes('premium')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    );
  };

  return (
    <div
      className="pc-card"
      id={`product-card-${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {product.tag && (
        <span className="pc-badge" id={`pc-badge-${product.id}`}>
          {product.tag}
        </span>
      )}

      {/* Wishlist heart button */}
      <button
        className={`pc-wish ${wished ? 'pc-wish--active' : ''}`}
        id={`pc-wish-${product.id}`}
        aria-label="Add to wishlist"
        onClick={(e) => {
          e.stopPropagation();
          setWished(!wished);
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill={wished ? '#ef4444' : 'none'}
          stroke={wished ? '#ef4444' : '#888'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="16"
          height="16"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Image area */}
      <Link to={`/product/${product.id}`} className="pc-img-link" id={`pc-img-${product.id}`}>
        {product.imgSrc ? (
            <img
              src={hovered && product.hoverImgSrc ? product.hoverImgSrc : product.imgSrc}
              alt={product.name}
              className="pc-img"
              loading="lazy"
              decoding="async"
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
        <Link to={`/product/${product.id}`} className="pc-name">
          {product.name}
        </Link>
        <div className="pc-qualities">
          {(product.desc || (product.qualities ? product.qualities.join(' | ') : '')).split('|').concat(['Premium Quality', 'Highly Durable']).filter(Boolean).slice(0, 3).map((q, idx) => {
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
          <span className="pc-price">{product.price}</span>
          {product.oldPrice && (
            <span className="pc-old-price">{product.oldPrice}</span>
          )}
        </div>

        <button className="pc-add-btn" id={`pc-add-${product.id}`}>
          Add to Cart
        </button>
      </div>
    </div>
  );
});

export default ProductCard;
