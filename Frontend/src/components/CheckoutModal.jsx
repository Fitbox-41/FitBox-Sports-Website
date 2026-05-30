import { useState } from 'react';
import axios from 'axios';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, orderId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '123 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    country: 'India'
  });

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
      
      const res = await axios.post('http://localhost:5000/api/orders/mock-payment', { 
        orderId, 
        shippingAddress: address 
      }, config);
      
      if (res.data.success) {
        alert("Mock Payment Successful! Invoice and Shipment created.");
        onSuccess(res.data.orderId);
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
      <div className="checkout-modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2>GoKwik Checkout (Mock)</h2>
        <p className="modal-subtitle">This screen mimics the GoKwik checkout overlay.</p>

        <div className="mock-address-form">
          <h3>Shipping Address</h3>
          <p className="address-note">Since GoKwik is bypassed, please provide a mock address for Delhivery shipment creation.</p>
          
          <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="Street" />
          <div className="input-row">
            <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City" />
            <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="State" />
          </div>
          <div className="input-row">
            <input type="text" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="ZIP Code" />
            <input type="text" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} placeholder="Country" disabled />
          </div>
        </div>

        <div className="modal-actions">
          <button className="confirm-payment-btn" onClick={handleConfirmPayment} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
