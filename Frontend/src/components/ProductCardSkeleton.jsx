import React from 'react';
import './ProductCard.css';

export default function ProductCardSkeleton() {
  return (
    <div className="pc-card">
      <div className="pc-skeleton-overlay" style={{ position: 'relative', opacity: 1, visibility: 'visible' }}>
        <div className="pc-skeleton-img"></div>
        <div className="pc-skeleton-content">
          <div className="pc-skeleton-line title"></div>
          <div className="pc-skeleton-line desc"></div>
          <div className="pc-skeleton-line desc short"></div>
          <div className="pc-skeleton-price"></div>
          <div className="pc-skeleton-btn"></div>
        </div>
      </div>
    </div>
  );
}
