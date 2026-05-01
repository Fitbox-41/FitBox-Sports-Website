import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductPage.css';

// Mock data for products
const allProducts = [
  { id: 1, name: 'Pro Hex Dumbbell Set', price: '₹2,499', oldPrice: '₹3,200', tag: 'New', imgSrc: '/sports-hexa-pvc-dumbbells-8-0-fitbox-sports-original-imahf77zyfemq8nj.jpeg', desc: 'Rubber-coated | Anti-roll | Premium Quality', longDesc: 'Our Pro Hex Dumbbells are designed for maximum durability and comfort. The hexagonal shape prevents rolling, while the rubber coating protects your floors and reduces noise. Perfect for home and commercial gym use.' },
  { id: 2, name: 'Basketball Size-7', price: '₹1,799', oldPrice: '₹2,100', tag: 'Hot', imgSrc: '/450-475-basketball-official-professional-match-ball-indoor-original-imahf79f7pmsybhj.jpeg', desc: 'Official Match | Indoor | High Grip', longDesc: 'Experience professional-grade play with our Size-7 Basketball. Features high-grip composite leather and deep channels for superior control. Designed for indoor match play.' },
  { id: 3, name: 'Speed Skipping Rope', price: '₹299', oldPrice: '₹499', imgSrc: '/skipping-rope-jump-rope-for-exercise-workout-men-women-red-rope-original-imahffyngy3yzz5z.jpeg', desc: 'Anti-tangle | Fast | Adjustable', longDesc: 'Boost your cardio with our high-speed skipping rope. Fully adjustable length and smooth rotation bearings make it ideal for double-unders and intense HIIT workouts.' },
  // More products can be added here...
];

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Find product by ID
    const found = allProducts.find(p => p.id === parseInt(productId));
    setProduct(found);
  }, [productId]);

  if (!product) {
    return (
      <div className="product-page">
        <Header />
        <div className="container no-product">
          <h2>Product Not Found</h2>
          <Link to="/" className="back-btn">Back to Shop</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-page">
      <Header />
      
      <main className="product-main container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> <span>Product</span> <span>/</span> <span className="active">{product.name}</span>
        </div>

        <div className="product-layout">
          {/* Left: Image Section */}
          <div className="product-gallery">
            <div className="main-image-wrap">
              {product.tag && <span className="product-tag">{product.tag}</span>}
              <img src={product.imgSrc} alt={product.name} className="main-image" />
            </div>
            {/* Thumbnails placeholder */}
            <div className="thumbnails">
               <div className="thumb active"><img src={product.imgSrc} alt="thumb" /></div>
               <div className="thumb"><img src={product.imgSrc} alt="thumb" /></div>
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="price-box">
              <span className="current-price">{product.price}</span>
              {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
              <span className="discount-tag">Save ₹{parseInt(product.oldPrice?.replace(/[^0-9]/g,'') || 0) - parseInt(product.price.replace(/[^0-9]/g,''))}</span>
            </div>

            <p className="short-desc">{product.desc}</p>

            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
              <button className="add-to-cart-btn">Add to Cart</button>
            </div>

            <div className="product-features">
              <div className="feature">
                <span className="icon">🚚</span>
                <span className="text">Free Shipping on orders above ₹999</span>
              </div>
              <div className="feature">
                <span className="icon">🔄</span>
                <span className="text">7 Days Return Policy</span>
              </div>
            </div>

            <div className="product-details-tab">
              <h3>Product Description</h3>
              <p>{product.longDesc}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
