import { memo } from 'react';
import { Link } from 'react-router-dom';
import './CategoryGridCard.css';

const CategoryGridCard = memo(({ card }) => {
  return (
    <div className="cgc-card" id={`cgc-card-${card.id}`}>

      {/* Card heading */}
      <h3 className="cgc-heading">{card.heading}</h3>

      {/* 2x2 image grid */}
      <div className="cgc-grid" id={`cgc-grid-${card.id}`}>
        {card.items.map((item) => (
          <Link
            key={item.id}
            to={item.path || '/products'}
            className="cgc-item"
            id={`cgc-item-${item.id}`}
          >
            {/* Image – use real src when available, else show placeholder */}
            <div className="cgc-img-wrap">
              {item.imgSrc ? (
                <img src={item.imgSrc} alt={item.label} className="cgc-img" loading="lazy" decoding="async" />
              ) : (
                /* Placeholder – replace with <img src="..." / loading="lazy" decoding="async"> later */
                <div className="cgc-img-placeholder">
                  <span className="cgc-ph-text">{item.label}</span>
                </div>
              )}
            </div>

            {/* Item label below image */}
            <span className="cgc-item-label">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* See all link */}
      <Link to={card.seeAllPath || '/products'} className="cgc-see-all" id={`cgc-see-all-${card.id}`}>
        See all products
      </Link>
    </div>
  );
});

export default CategoryGridCard;
