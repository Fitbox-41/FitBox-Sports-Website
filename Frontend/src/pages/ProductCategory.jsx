import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './ProductCategory.css';

import allProducts from '../data/products';

// We can define a mapping of category labels to their banner images/descriptions
const categoryMeta = {
  'wall-mounting': { label: 'Wall Mounting', desc: 'Professional grade pull-up bars and mounting equipment.', banner: '/2.jpg-scaled.webp' },
  'weighted-vests': { label: 'Weighted Vests', desc: 'Take your training to the next level with adjustable vests.', banner: '/4.jpg.webp' },
  'clothing': { label: 'Clothing', desc: 'Premium athletic wear for maximum performance and comfort.', banner: '/5.jpg.webp' },
  'balls': { label: 'Balls', desc: 'High-quality balls for football, basketball, and more.', banner: '/7.jpg.webp' },
  'toning-tube': { label: 'Toning Tube', desc: 'Versatile resistance tubes for full-body workouts.', banner: '/6.jpg.webp' },
  'dumbbells': { label: 'Dumbbells', desc: 'Precision-engineered weights for strength training.', banner: '/3.jpg-scaled.webp' },
  'resistance-bands': { label: 'Resistance Bands', desc: 'Durable elastic bands for flexibility and strength.', banner: '/1.jpg-scaled.webp' },
  'ropes': { label: 'Ropes', desc: 'High-speed skipping ropes for cardio and agility.', banner: '/skipping-rope-jump-rope-for-exercise-workout-men-women-red-rope-original-imahffyngy3yzz5z.webp' },
  'push-up-bars': { label: 'Push-up Bars', desc: 'Ergonomic bars to enhance your upper body strength.', banner: '/barrr.webp' },
  'kettlebells': { label: 'Kettlebells', desc: 'Cast iron and vinyl coated kettlebells for functional fitness.', banner: '/premium-kettlebell-cast-iron-vinyl-coated-solid-kettlebell-original-imahf9kng7zgmjdz-removebg-preview.webp' },
  'supporters': { label: 'Supporters', desc: 'Essential support for wrists, knees, and joints.', banner: '/left-and-right-hand-premium-wrist-supporter-l-wrist-band-with-original-imahfdyysgharah4.webp' },
  'belts': { label: 'Belts', desc: 'Heavy-duty weightlifting belts for core stability.', banner: '/left-and-right-hand-weightlifting-belt-leather-gym-belt-for-original-imahff86zdtkkus2.webp' },
  'gloves': { label: 'Gloves', desc: 'Protective gear for boxing and weightlifting.', banner: '/boxing-focus-pads-mitts-curved-punching-pads-with-high-density-original-imahfewzkcgrhhkv.webp' },
  'grippers': { label: 'Grippers', desc: 'Adjustable hand grippers to build forearm strength.', banner: '/gripper.webp' },
  'shakers': { label: 'Shakers', desc: 'Leak-proof shaker bottles for your protein and supplements.', banner: '/500-shaker-bottle-with-2-removable-compartment-for-protein-pre-original-imahff7yhwbrxgmw.webp' },
  'bats': { label: 'Bats', desc: 'Premium bats for cricket and other sports.', banner: '/pickleball-paddle-premium-boarded-composite-surface-shock-original-imahf7bcqddgr5nf.webp' },
};

export default function ProductCategory() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const meta = categoryMeta[categoryId] || { label: 'Category', desc: 'Browse our premium sports equipment.', banner: '/2.jpg-scaled.webp' };

  useEffect(() => {
    const cid = categoryId || '';
    const filtered = allProducts.filter(p => {
      const categoryMatch = p.category && p.category.toLowerCase().includes(cid.replace(/-/g, ' ').toLowerCase());
      const nameMatch = p.name && p.name.toLowerCase().includes(cid.replace(/-/g, ' ').toLowerCase());
      return categoryMatch || nameMatch;
    });
    
    setProducts(filtered.length > 0 ? filtered : allProducts);
    window.scrollTo(0, 0);
  }, [categoryId]);

  return (
    <div className="category-page">
      <Header hideSaleRibbon={false} />
      
      {/* Spacer for fixed header */}
      <div className="header-spacer" />

      <section className="category-hero">
        <div className="hero-bg">
          <img src={meta.banner} alt={meta.label} />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="separator">/</span>
            <span className="current">{meta.label}</span>
          </div>
          <h1 className="category-title">{meta.label}</h1>
          <p className="category-desc">{meta.desc}</p>
        </div>
      </section>

      <main className="category-main container">
        <div className="category-controls">
          <div className="products-count">
            Showing <span>{products.length}</span> products
          </div>
          
          <div className="control-actions">
            <button 
              className={`filter-toggle ${filterOpen ? 'active' : ''}`}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </button>
            
            <div className="sort-wrapper">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="category-layout">
          {/* Mobile Filter Sidebar - Overlay */}
          <aside className={`filter-sidebar ${filterOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="close-sidebar" onClick={() => setFilterOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="filter-groups">
              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-range-inputs">
                  <input type="number" placeholder="Min" />
                  <input type="number" placeholder="Max" />
                </div>
              </div>
              
              <div className="filter-group">
                <h4>Availability</h4>
                <label className="filter-checkbox">
                  <input type="checkbox" />
                  <span>In Stock</span>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" />
                  <span>Out of Stock</span>
                </label>
              </div>

              <div className="filter-group">
                <h4>Brand</h4>
                <label className="filter-checkbox">
                  <input type="checkbox" checked readOnly />
                  <span>FitBox Sports</span>
                </label>
              </div>
            </div>
            
            <div className="sidebar-footer">
              <button className="apply-filters-btn" onClick={() => setFilterOpen(false)}>Apply Filters</button>
              <button className="clear-filters-btn">Clear All</button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="products-grid-wrapper">
            {products.length > 0 ? (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="64" height="64">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="clear-filters-btn" onClick={() => window.location.reload()}>Reset All</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
