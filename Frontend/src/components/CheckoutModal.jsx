import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import './CheckoutModal.css';
import { Link } from 'react-router-dom';

export default function CheckoutModal({ isOpen, onClose, orderId, checkoutItems, checkoutTotal, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [step, setStep] = useState(1); // 1 = shipping, 2 = payment mode
  const [paymentMode, setPaymentMode] = useState(''); // 'Online' or 'COD'
  const { currentUser } = useAuth();
  
  // Shipping details state
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');

  useEffect(() => {
    if (currentUser && isOpen) {
      setShippingName(currentUser.name || '');
      setShippingPhone(currentUser.phone || '');
      setSelectedAddressIdx(0);
      setStep(1);
      setPaymentMode('');
    }
  }, [currentUser, isOpen]);

  // Scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCloseModal = async () => {
    if (orderId && !showSuccessToast) {
      try {
        const token = localStorage.getItem('fitbox_token');
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        await axios.delete(`${apiUrl}/api/orders/${orderId}/cancel`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to cancel pending order", err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const getShippingAddress = () => {
    const baseAddress = currentUser?.addresses && currentUser.addresses.length > selectedAddressIdx 
      ? currentUser.addresses[selectedAddressIdx] 
      : { street: '123 Test', city: 'Mumbai', state: 'MH', zip: '400001', country: 'India' };
      
    return {
      ...baseAddress,
      name: shippingName,
      phone: shippingPhone
    };
  };

  const handleProceedToPaymentMode = () => {
    setStep(2);
  };

  const handleOnlinePayment = async () => {
    if (!orderId) {
      alert("Order ID missing!");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const shippingAddress = getShippingAddress();
      
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${apiUrl}/api/orders/mock-payment`, { 
        orderId, 
        shippingAddress 
      }, config);
      
      if (res.data.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          onSuccess(res.data.orderId);
        }, 2500);
      } else {
        alert("Payment failed: " + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCODPayment = async () => {
    if (!orderId) {
      alert("Order ID missing!");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const shippingAddress = getShippingAddress();
      
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${apiUrl}/api/orders/cod-payment`, { 
        orderId, 
        shippingAddress 
      }, config);
      
      if (res.data.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          onSuccess(res.data.orderId);
        }, 2500);
      } else {
        alert("COD order failed: " + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while placing COD order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-modal-overlay">
      {showSuccessToast && (
        <div className="success-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Order Completed Successfully!
        </div>
      )}

      <div className="checkout-modal-content">
        <button className="close-btn" onClick={handleCloseModal} disabled={loading || showSuccessToast}>&times;</button>
        
        {step === 1 && (
          <>
            <h2>Secure Checkout</h2>
            <p className="modal-subtitle">Fast & Secure Payment</p>

            <div className="order-summary-section">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {checkoutItems && checkoutItems.length > 0 ? (
                  checkoutItems.map((item, idx) => (
                    <div key={idx} className="summary-item">
                      <span className="summary-item-name">{item.name} {item.selectedVariant ? `(${item.selectedVariant})` : ''} x {item.quantity}</span>
                      <span className="summary-item-price">₹{Number(String(item.price).replace(/[^0-9.-]+/g,"")) * item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <p>No items found</p>
                )}
              </div>
              <div className="summary-total">
                <span>Total to Pay</span>
                <span>₹{checkoutTotal}</span>
              </div>
            </div>

            <div className="shipping-details-section">
              <h3>Shipping Details</h3>
              <div className="shipping-form-group">
                <label>Recipient Name</label>
                <input 
                  type="text" 
                  value={shippingName} 
                  onChange={e => setShippingName(e.target.value)} 
                  placeholder="Full Name"
                />
              </div>
              <div className="shipping-form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={shippingPhone} 
                  onChange={e => setShippingPhone(e.target.value)} 
                  placeholder="Phone Number"
                />
              </div>
              <div className="shipping-form-group">
                <label>Shipping Address</label>
                {currentUser?.addresses && currentUser.addresses.length > 0 ? (
                  <select 
                    value={selectedAddressIdx} 
                    onChange={e => setSelectedAddressIdx(Number(e.target.value))}
                    className="address-selector"
                  >
                    {currentUser.addresses.map((addr, idx) => (
                      <option key={idx} value={idx}>
                        {addr.street}, {addr.city}, {addr.state} {addr.zip}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="no-address-warning">No addresses found.</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button className="confirm-payment-btn" onClick={handleProceedToPaymentMode} disabled={loading || showSuccessToast}>
                Proceed to Payment
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Choose Payment Method</h2>
            <p className="modal-subtitle">Select how you'd like to pay</p>

            <div className="payment-mode-section">
              <button 
                className={`payment-mode-option ${paymentMode === 'Online' ? 'payment-mode-option--selected' : ''}`}
                onClick={() => setPaymentMode('Online')}
              >
                <div className="payment-mode-radio">
                  <div className={`payment-mode-radio-inner ${paymentMode === 'Online' ? 'active' : ''}`}></div>
                </div>
                <div className="payment-mode-info">
                  <div className="payment-mode-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Online Payment
                  </div>
                  <span className="payment-mode-desc">Pay securely via UPI, Card, or Net Banking</span>
                </div>
              </button>

              <button 
                className={`payment-mode-option ${paymentMode === 'COD' ? 'payment-mode-option--selected' : ''}`}
                onClick={() => setPaymentMode('COD')}
              >
                <div className="payment-mode-radio">
                  <div className={`payment-mode-radio-inner ${paymentMode === 'COD' ? 'active' : ''}`}></div>
                </div>
                <div className="payment-mode-info">
                  <div className="payment-mode-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Cash on Delivery
                  </div>
                  <span className="payment-mode-desc">Pay with cash when your order arrives</span>
                </div>
              </button>
            </div>

            <div className="cod-terms-box">
              <div className="cod-terms-title">COD Terms</div>
              <ul className="cod-terms-list">
                <li>COD orders are marked as <strong>Pending</strong> until delivery is completed.</li>
                <li>Please keep the exact amount ready at delivery. Courier may not have change.</li>
                <li>COD availability may depend on your delivery location/pincode.</li>
              </ul>
              <div className="cod-terms-foot">
                Need help? See <Link to="/shipping" onClick={handleCloseModal}>Shipping</Link> & <Link to="/returns" onClick={handleCloseModal}>Returns</Link>.
              </div>
            </div>

            <div className="payment-mode-total">
              <span>Amount to Pay</span>
              <span>₹{checkoutTotal}</span>
            </div>

            <div className="modal-actions payment-mode-actions">
              <button className="back-btn" onClick={() => setStep(1)} disabled={loading}>
                ← Back
              </button>
              <button 
                className="confirm-payment-btn" 
                onClick={paymentMode === 'COD' ? handleCODPayment : handleOnlinePayment}
                disabled={loading || showSuccessToast || !paymentMode}
              >
                {loading ? 'Processing...' : paymentMode === 'COD' ? 'Place Order (COD)' : 'Pay Now'}
              </button>
            </div>
          </>
        )}

        {showSuccessToast && (
          <div className="checkout-success-overlay">
            <div className="checkout-success-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h2>{paymentMode === 'COD' ? 'Order Placed!' : 'Payment Successful!'}</h2>
              <p>Redirecting to your orders...</p>
            </div>
          </div>
        )}
      </div>
      <Loader isVisible={loading} />
    </div>
  );
}
