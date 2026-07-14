import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CODGateway.css';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';

export default function CODGateway() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { deliveryFee } = useSettings();
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India'
  });
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('fitbox_token');
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        const res = await axios.get(`${apiUrl}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success && res.data.order) {
          setOrder(res.data.order);
          if (res.data.order.shippingAddress) {
            setShippingAddress(res.data.order.shippingAddress);
          }
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    let timer;
    if (success && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (success && countdown === 0) {
      navigate('/orders');
    }
    return () => clearInterval(timer);
  }, [success, countdown, navigate]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const token = localStorage.getItem('fitbox_token');
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      
      const res = await axios.post(`${apiUrl}/api/orders/cod-payment`, { 
        orderId, 
        shippingAddress 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setSuccess(true);
        clearCart();
      } else {
        alert("Failed to confirm COD: " + res.data.message);
        setIsConfirming(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while confirming the order.");
      setIsConfirming(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="cod-gateway-loading">Loading Gateway...</div>;
  }

  if (error || !order) {
    return <div className="cod-gateway-error">{error || 'Order not found'}</div>;
  }

  if (success) {
    return (
      <div className="cod-gateway-success-container">
        <div className="cod-gateway-success-box">
          <div className="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your Cash on Delivery order has been placed successfully.</p>
          <p>You will pay ₹{order.totalAmount} at the time of delivery.</p>
          
          <div className="countdown-box">
            Redirecting to your orders in <span>{countdown}</span> seconds...
          </div>
          
          <button onClick={() => navigate('/orders')} className="manual-redirect-btn">
            Click here to return to orders
          </button>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const actualDeliveryFee = order.totalAmount - subtotal; // Calculate it from the saved total

  return (
    <div className="cod-gateway-wrapper">
      <div className="cod-gateway-container">
        
        {/* Left Side: Brand & Total */}
        <div className="cod-left-pane">
          <div className="cod-brand-header">
            <img src="/favicon.ico" alt="Fitbox Logo" className="cod-logo" loading="lazy" decoding="async" />
            <span className="cod-brand-name">Fitbox Sports</span>
          </div>
          
          <div className="cod-total-box">
            <span className="cod-total-label">Total</span>
            <span className="cod-total-colon">:</span>
            <span className="cod-total-amount">₹{order.totalAmount}</span>
          </div>
          
          <div className="cod-illustration">
            {/* Using a placeholder SVG resembling a delivery/shopping cart */}
            <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 150 L200 150 L200 50 C150 70 100 20 0 50 Z" fill="#ff6b35" opacity="0.9" />
              <circle cx="50" cy="110" r="15" fill="#fff" />
              <rect x="80" y="80" width="40" height="40" fill="#fff" rx="5" />
              <path d="M90 80 V70 C90 60 110 60 110 70 V80" fill="none" stroke="#fff" strokeWidth="4" />
              <rect x="130" y="90" width="30" height="30" fill="#fca311" rx="4" />
              <line x1="130" y1="105" x2="160" y2="105" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="cod-powered-by">
              Powered by <strong>FitBox Gateway</strong>
            </div>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="cod-right-pane">
          <div className="cod-right-header">
            <h3>Cash on Delivery</h3>
            <button className="cod-close-btn" onClick={() => navigate(-1)}>&times;</button>
          </div>
          
          <div className="cod-right-content">
            
            <div className="cod-section">
              <h4 className="cod-section-title">Order Summary</h4>
              <div className="cod-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="cod-item">
                    {item.imgSrc && <img src={item.imgSrc} alt={item.name} className="cod-item-img" loading="lazy" decoding="async" />}
                    <div className="cod-item-details">
                      <div className="cod-item-name">{item.name}</div>
                      <div className="cod-item-meta">Qty: {item.quantity} {item.selectedVariant ? `| ${item.selectedVariant}` : ''}</div>
                    </div>
                    <div className="cod-item-price">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="cod-summary-totals">
                <div className="cod-summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="cod-summary-row">
                  <span>Delivery Fee</span>
                  <span>{actualDeliveryFee === 0 ? 'FREE' : `₹${actualDeliveryFee}`}</span>
                </div>
              </div>
            </div>

            <div className="cod-section">
              <div className="cod-section-header">
                <h4 className="cod-section-title">Shipping Details</h4>
                {!isEditing && (
                  <button className="cod-edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                )}
              </div>
              
              <div className="cod-shipping-box">
                {isEditing ? (
                  <div className="cod-edit-form">
                    <input type="text" name="name" value={shippingAddress.name} onChange={handleInputChange} placeholder="Full Name" />
                    <input type="text" name="phone" value={shippingAddress.phone} onChange={handleInputChange} placeholder="Phone Number" />
                    <input type="text" name="street" value={shippingAddress.street} onChange={handleInputChange} placeholder="Street Address" />
                    <div className="cod-form-row">
                      <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} placeholder="City" />
                      <input type="text" name="state" value={shippingAddress.state} onChange={handleInputChange} placeholder="State" />
                    </div>
                    <div className="cod-form-row">
                      <input type="text" name="zip" value={shippingAddress.zip} onChange={handleInputChange} placeholder="Pincode" />
                      <button className="cod-save-edit-btn" onClick={() => setIsEditing(false)}>Done</button>
                    </div>
                  </div>
                ) : (
                  <div className="cod-shipping-display">
                    <p><strong>{shippingAddress.name}</strong> ({shippingAddress.phone})</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zip}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
          
          <div className="cod-right-footer">
            <button 
              className="cod-confirm-btn" 
              onClick={handleConfirm}
              disabled={isConfirming || isEditing}
            >
              {isConfirming ? 'Processing...' : 'Confirm COD Order'}
            </button>
            <div className="cod-timeout-warning">
              This page will timeout if left inactive
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
