import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Orders.css';

export default function Orders() {
  const { currentUser } = useAuth();
  const { toggleWishlist, wishlist } = useCart();
  const orders = currentUser?.orders || [];

  return (
    <div className="orders-page">
      <Header />
      <div className="header-spacer" style={{ height: '110px' }} />

      <main className="orders-main container">
        <h1 className="orders-title">Your Orders</h1>

        {orders.length > 0 ? (
          <div className="orders-list-container">
            {orders.map((item, idx) => {
              const img = item.image || item.imgSrc || (item.variants && item.variants[0].images[0]);
              const inWishlist = wishlist.some(w => w.id === item.id);
              return (
                <div key={idx} className="orders-list-item">
                  <Link 
                    to={`/product/${item.id}`}
                    className="orders-item-image-wrapper"
                  >
                    <img src={img} alt={item.name} className="orders-item-image" />
                  </Link>

                  <div className="orders-item-details">
                    <Link 
                      to={`/product/${item.id}`}
                      className="orders-item-name"
                    >
                      {item.name}
                    </Link>
                    <span className="orders-item-price">₹{String(item.price).replace(/[^0-9,.]/g, '')}</span>
                    <span className="orders-item-date">Purchased recently</span>
                  </div>

                  <div className="orders-actions-col">
                    <button 
                      className={`orders-wishlist-btn ${inWishlist ? 'active' : ''}`} 
                      onClick={() => toggleWishlist(item)}
                    >
                      <svg viewBox="0 0 24 24" fill={inWishlist ? '#ff6b35' : 'none'} stroke={inWishlist ? '#ff6b35' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-orders-state">
            <div className="empty-orders-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="80" height="80">
                <path d="M9 17H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-4" />
                <rect x="9" y="3" width="6" height="14" rx="1" />
              </svg>
            </div>
            <h2>You haven't placed any orders yet</h2>
            <p>Once you make a purchase, your past orders will appear here.</p>
            <Link to="/" className="continue-shopping-btn">Explore Products</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
