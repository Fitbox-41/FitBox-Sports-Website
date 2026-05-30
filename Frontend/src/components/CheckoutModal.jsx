import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, orderId, checkoutItems, checkoutTotal, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
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
        await axios.delete(`http://localhost:5000/api/orders/${orderId}/cancel`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to cancel pending order", err);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  const handleConfirmPayment = async () => {
    if (!orderId) {
      alert("Order ID missing!");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const baseAddress = currentUser?.addresses && currentUser.addresses.length > selectedAddressIdx 
        ? currentUser.addresses[selectedAddressIdx] 
        : { street: '123 Test', city: 'Mumbai', state: 'MH', zip: '400001', country: 'India' };
        
      const shippingAddress = {
        ...baseAddress,
        name: shippingName,
        phone: shippingPhone
      };
      
      const res = await axios.post('http://localhost:5000/api/orders/mock-payment', { 
        orderId, 
        shippingAddress 
      }, config);
      
      if (res.data.success) {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          onSuccess(res.data.orderId);
        }, 2500); // Wait for toast to be visible before redirect
      } else {
        alert("Payment failed: " + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during mock payment.");
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
          Order Completed Successfully! Invoice Generated.
        </div>
      )}

      <div className="checkout-modal-content">
        <button className="close-btn" onClick={handleCloseModal} disabled={loading || showSuccessToast}>&times;</button>
        
        <h2>GoKwik Checkout</h2>
        <p className="modal-subtitle">Fast & Secure Payment</p>

        <div className="order-summary-section">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {checkoutItems && checkoutItems.length > 0 ? (
              checkoutItems.map((item, idx) => (
                <div key={idx} className="summary-item">
                  <span className="summary-item-name">{item.name} {item.selectedVariant ? `(${item.selectedVariant})` : ''} x {item.quantity}</span>
                  <span className="summary-item-price">₹{item.price * item.quantity}</span>
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
          <button className="confirm-payment-btn" onClick={handleConfirmPayment} disabled={loading || showSuccessToast}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
