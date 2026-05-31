import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { flattenProducts } from '../utils/flattenProducts';
import './ProductCategory.css';

import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
// We can define a mapping of category labels to their banner images/descriptions
const categoryMeta = {
  'wall-mounting': { label: 'Wall Mounting', desc: 'Professional grade pull-up bars and mounting equipment.', banner: '/Untitled-design-19.webp' },
  'weighted-vests': { label: 'Weighted Vests', desc: 'Take your training to the next level with adjustable vests.', banner: '/Untitled-design-19.webp' },
  'clothing': { label: 'Clothing', desc: 'Premium athletic wear for maximum performance and comfort.', banner: '/Untitled-design-19.webp' },
  'balls': { label: 'Balls', desc: 'High-quality balls for football, basketball, and more.', banner: '/Untitled-design-19.webp' },
  'toning-tube': { label: 'Toning Tube', desc: 'Versatile resistance tubes for full-body workouts.', banner: '/Untitled-design-19.webp' },
  'dumbbells': { label: 'Dumbbells', desc: 'Precision-engineered weights for strength training.', banner: '/Untitled-design-19.webp' },
  'resistance-bands': { label: 'Resistance Bands', desc: 'Durable elastic bands for flexibility and strength.', banner: '/Untitled-design-19.webp' },
  'ropes': { label: 'Ropes', desc: 'High-speed skipping ropes for cardio and agility.', banner: '/Untitled-design-19.webp' },
  'push-up-bars': { label: 'Push-up Bars', desc: 'Ergonomic bars to enhance your upper body strength.', banner: '/Untitled-design-19.webp' },
  'kettlebells': { label: 'Kettlebells', desc: 'Cast iron and vinyl coated kettlebells for functional fitness.', banner: '/Untitled-design-19.webp' },
  'supporters': { label: 'Supporters', desc: 'Essential support for wrists, knees, and joints.', banner: '/Untitled-design-19.webp' },
  'belts': { label: 'Belts', desc: 'Heavy-duty weightlifting belts for core stability.', banner: '/Untitled-design-19.webp' },
  'gloves': { label: 'Gloves', desc: 'Protective gear for boxing and weightlifting.', banner: '/Untitled-design-19.webp' },
  'grippers': { label: 'Grippers', desc: 'Adjustable hand grippers to build forearm strength.', banner: '/Untitled-design-19.webp' },
  'shakers': { label: 'Shakers', desc: 'Leak-proof shaker bottles for your protein and supplements.', banner: '/Untitled-design-19.webp' },
  'bats': { label: 'Bats', desc: 'Premium bats for cricket and other sports.', banner: '/Untitled-design-19.webp' },
};

export default function ProductCategory() {
  const { products: allProducts, loading } = useContext(ProductContext);
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  
  // Filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);

  const formatLabel = (id) => (id || '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const meta = categoryMeta[categoryId] || { 
    label: formatLabel(categoryId) || 'Category', 
    desc: `Browse our premium ${formatLabel(categoryId).toLowerCase() || 'sports'} equipment.`, 
    banner: '/Untitled-design-19.webp' 
  };

  useEffect(() => {
    const cid = categoryId || '';
    const categoryProducts = allProducts.filter(p => {
      const query1 = cid.replace(/-/g, ' ').toLowerCase();
      const query2 = query1.replace(/ and /g, ' & ');
      
      const categoryMatch = p.category && (p.category.toLowerCase().includes(query1) || p.category.toLowerCase().includes(query2));
      const subCategoryMatch = p.subCategory && (p.subCategory.toLowerCase().includes(query1) || p.subCategory.toLowerCase().includes(query2));
      const nameMatch = p.name && (p.name.toLowerCase().includes(query1) || p.name.toLowerCase().includes(query2));
      
      return categoryMatch || subCategoryMatch || nameMatch;
    });
    
    setProducts(categoryProducts);
    window.scrollTo(0, 0);
  }, [categoryId, allProducts]);

  useEffect(() => {
    let result = [...products];

    // Filter by Price
    if (minPrice) result = result.filter(p => p.price >= parseInt(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= parseInt(maxPrice));

    // Filter by Availability
    if (inStockOnly && !outOfStockOnly) result = result.filter(p => !p.isOutOfStock);
    if (outOfStockOnly && !inStockOnly) result = result.filter(p => p.isOutOfStock);

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'featured') {
      // Custom logic for featured (e.g., show New first then in-stock)
      result.sort((a, b) => {
        if (a.isNew !== b.isNew) return b.isNew ? 1 : -1;
        if (a.isOutOfStock !== b.isOutOfStock) return a.isOutOfStock ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(result);
  }, [products, sortBy, minPrice, maxPrice, inStockOnly, outOfStockOnly]);

  // Automatically expand products with multiple variants into separate cards
  const expandedProducts = useMemo(() => {
    return flattenProducts(filteredProducts).map(p => {
      return {
        ...p,
        displayId: p.displayId || p.id,
        price: typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : p.price,
        oldPrice: typeof p.oldPrice === 'number' ? `₹${p.oldPrice.toLocaleString('en-IN')}` : p.oldPrice
      };
    });
  }, [filteredProducts]);

  return (
    <div className="category-page">
      <Header hideSubHeader={true} hideSaleRibbon={false} />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading products...</div>
      ) : (
        <>
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
            Showing <span>{expandedProducts.length}</span> products
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
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)} 
                  />
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <h4>Availability</h4>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly} 
                    onChange={(e) => setInStockOnly(e.target.checked)} 
                  />
                  <span>In Stock</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={outOfStockOnly} 
                    onChange={(e) => setOutOfStockOnly(e.target.checked)} 
                  />
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
              <button className="clear-filters-btn" onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setInStockOnly(false);
                setOutOfStockOnly(false);
                setSortBy('featured');
              }}>Clear All</button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="products-grid-wrapper">
            {expandedProducts.length > 0 ? (
              <div className="products-grid">
                {expandedProducts.map((displayProduct) => (
                  <ProductCard key={displayProduct.displayId} product={displayProduct} showStatusTags={true} />
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
                <button className="clear-filters-btn" onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setInStockOnly(false);
                  setOutOfStockOnly(false);
                  setSortBy('featured');
                }}>Reset All</button>
              </div>
            )}
          </div>
        </div>
      </main>
      </>
      )}

      <Footer />
    </div>
  );
}
