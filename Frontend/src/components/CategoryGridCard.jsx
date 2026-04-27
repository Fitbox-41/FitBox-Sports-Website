import { Link } from 'react-router-dom';
import './CategoryGridCard.css';

/**
 * CategoryGridCard
 * Amazon-style card: heading + 2x2 grid of sub-items + "See all" link.
 *
 * Props:
 *  card = {
 *    id,
 *    heading,        // e.g. "Up to 40% off | Dumbbells"
 *    seeAllPath,     // route for "See all" link
 *    items: [        // exactly 4 items for the 2x2 grid
 *      { id, label, imgSrc (optional) },
 *      ...
 *    ]
 *  }
 */
export default function CategoryGridCard({ card }) {
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
                <img src={item.imgSrc} alt={item.label} className="cgc-img" />
              ) : (
                /* Placeholder – replace with <img src="..." /> later */
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
        See all offers
      </Link>
    </div>
  );
}
