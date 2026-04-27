import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

/**
 * ProductCard
 * Used in the "New Arrivals" carousel.
 *
 * Props:
 *  product = {
 *    id, name, desc, price, oldPrice, tag,
 *    imgSrc (optional – leave empty for placeholder),
 *    hoverImgSrc (optional)
 *  }
 */
export default function ProductCard({ product }) {
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="pc-card"
      id={`product-card-${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* "New" badge */}
      <span className="pc-badge" id={`pc-badge-${product.id}`}>
        {product.tag || 'New'}
      </span>

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
        {/* Heart SVG – fill changes when wished */}
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

      {/* Image area – swap on hover */}
      <Link to={`/product/${product.id}`} className="pc-img-link" id={`pc-img-${product.id}`}>
        {product.imgSrc ? (
          /* Real image provided */
          <img
            src={hovered && product.hoverImgSrc ? product.hoverImgSrc : product.imgSrc}
            alt={product.name}
            className="pc-img"
          />
        ) : (
          /* Placeholder shown until user adds real image */
          <div className={`pc-placeholder ${hovered ? 'pc-placeholder--hover' : ''}`}>
            <div className="pc-placeholder-label">
              {hovered ? 'Hover View' : product.name}
            </div>
            <div className="pc-placeholder-hint">
              {hovered ? product.desc : 'Add image: imgSrc prop'}
            </div>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="pc-body">
        <Link to={`/product/${product.id}`} className="pc-name">
          {product.name}
        </Link>
        <p className="pc-desc">{product.desc}</p>

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
}
