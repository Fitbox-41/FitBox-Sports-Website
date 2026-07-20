import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import CheckoutModal from '../components/CheckoutModal';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, toggleWishlist, wishlist, clearCart } = useCart();
  const { currentUser, setShowLoginModal } = useAuth();
  const { deliveryFee, freeDeliveryThreshold } = useSettings();
  const navigate = useNavigate();
  // Stable key per checkout attempt so a retry / double-submit can't create a
  // duplicate order or double-spend points. Reset only after a confirmed success.
  const idempotencyKeyRef = useRef(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);
  const [applyPoints, setApplyPoints] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fetchWallet = async () => {
        try {
          const token = localStorage.getItem('fitbox_token');
          const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
          const res = await axios.get(`${apiUrl}/api/wallet`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setWalletBalance(res.data.balance);
          }
        } catch (error) {
          console.error("Failed to fetch wallet:", error);
        }
      };
      fetchWallet();
    }
  }, [currentUser]);

  const parsePrice = (val) => Number(String(val).replace(/[^0-9.-]+/g,""));
  
  const subtotal = cart.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0);
  const shipping = subtotal > freeDeliveryThreshold || subtotal === 0 ? 0 : deliveryFee;

  const POINT_VALUE_INR = 2;
  const maxPointsApplicable = Math.floor(subtotal / POINT_VALUE_INR);
  const pointsToUse = applyPoints ? Math.min(walletBalance, maxPointsApplicable) : 0;
  const discount = pointsToUse * POINT_VALUE_INR;

  const total = subtotal + shipping - discount;

  const handleCheckout = async () => {
    if (isProcessing) return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!currentUser.addresses || currentUser.addresses.length === 0 || !currentUser.phone) {
      alert("Please complete your account details by adding a phone number and shipping address before buying.");
      navigate('/account');
      return;
    }
    
    setIsProcessing(true);
    // Reuse the same key across retries of this checkout attempt.
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        (window.crypto?.randomUUID?.() ?? `ck_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    }
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${apiUrl}/api/orders/place`, {
        items: cart,
        totalAmount: total,
        deliveryCharge: shipping,
        appliedPoints: pointsToUse,
        idempotencyKey: idempotencyKeyRef.current
      }, config);

      if (res.data.success) {
        idempotencyKeyRef.current = null; // fresh key for the next distinct order
        setCurrentOrderId(res.data.orderId);
        setIsCheckoutModalOpen(true);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to initiate checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  return (
    <div className="cart-page">
      <Header hideSubHeader={true} hideSaleRibbon={false} />
      <div className="header-spacer" style={{ height: '111px' }} />

      <main className="cart-main container">
        <h1 className="cart-title">Your Shopping Cart</h1>

        {cart.length > 0 ? (
          <div className="cart-layout">
            <div className="cart-items-section">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedVariant}`} className="cart-item-card">
                  <Link 
                    to={`/product/${item.id || item._id || item.productId}`} 
                    className="cart-item-img-wrap"
                  >
                    <img 
                      src={item.imgSrc && typeof item.imgSrc === 'string' ? item.imgSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp') : item.imgSrc} 
                      alt={item.name} 
                      loading="lazy" 
                      decoding="async" 
                    />
                  </Link>
                  
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <Link 
                        to={`/product/${item.id || item._id || item.productId}`} 
                        className="cart-item-name"
                      >
                        {item.name}
                      </Link>
                      <span className="cart-item-price">₹{parsePrice(item.price) * item.quantity}</span>
                    </div>
                    
                    <div className="cart-item-meta">
                      {item.selectedVariant && <span>Color: <strong>{item.selectedVariant}</strong></span>}
                      {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.selectedVariant, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedVariant, 1)}>+</button>
                      </div>

                      <div className="cart-item-secondary-actions">
                        <button 
                          className={`action-btn wishlist-btn ${isInWishlist(item.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(item)}
                        >
                          <svg viewBox="0 0 24 24" fill={isInWishlist(item.id) ? '#ef4444' : 'none'} stroke={isInWishlist(item.id) ? '#ef4444' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {isInWishlist(item.id) ? 'In Wishlist' : 'Add to Wishlist'}
                        </button>
                        <button className="action-btn remove-btn" onClick={() => removeFromCart(item.id, item.selectedVariant)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary-section">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {walletBalance > 0 && (
                  <div className="wallet-apply-section" style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Wallet Balance</span>
                      <span style={{ color: '#ff6b35', fontWeight: '700' }}>{walletBalance} Pts</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={applyPoints} 
                        onChange={(e) => setApplyPoints(e.target.checked)} 
                        style={{ accentColor: '#ff6b35', width: '16px', height: '16px' }}
                      />
                      Apply points for discount
                    </label>
                  </div>
                )}
                {applyPoints && pointsToUse > 0 && (
                  <div className="summary-row" style={{ color: '#10b981' }}>
                    <span>Points Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="summary-divider" />
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
                <button 
                  className={`checkout-btn ${isProcessing ? 'checkout-btn--disabled' : ''}`} 
                  onClick={handleCheckout} 
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing Checkout...' : 'Proceed to Checkout'}
                </button>
                <div className="secure-checkout-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure SSL Checkout
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="empty-cart-state">
            <div className="empty-cart-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="80" height="80">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/" className="continue-shopping-btn">Continue Shopping</Link>
          </div>
        )}
      </main>

      <Footer />
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        orderId={currentOrderId}
        checkoutItems={cart}
        checkoutTotal={total}
        deliveryFee={shipping}
        onSuccess={(id) => {
          setIsCheckoutModalOpen(false);
          clearCart();
          navigate('/orders');
        }}
      />
    </div>
  );
}
