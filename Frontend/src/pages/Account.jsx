import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './Account.css';

export default function Account() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState([]);

  // New Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    } else {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddresses(currentUser.addresses || []);
    }
  }, [currentUser, navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({ name, phone, addresses });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zip) {
      setErrorMsg('Please fill in street, city, and ZIP code.');
      return;
    }
    setAddresses([...addresses, newAddress]);
    setNewAddress({ street: '', city: '', state: '', zip: '', country: '' });
    setShowAddAddress(false);
    setErrorMsg('');
  };

  const handleRemoveAddress = (index) => {
    const updated = [...addresses];
    updated.splice(index, 1);
    setAddresses(updated);
  };

  if (!currentUser) return null;

  return (
    <div className="account-page">
      <Header />
      <div className="header-spacer" style={{ height: '110px' }} />

      <div className="account-container">
        <h1 className="account-title">Personal Details</h1>
        
        {successMsg && <div className="account-success">{successMsg}</div>}
        {errorMsg && <div className="account-error">{errorMsg}</div>}

        <div className="account-card">
          <form className="account-form" onSubmit={handleSaveProfile}>
            
            <div className="form-group">
              <label>Email Address (Cannot be changed)</label>
              <input type="email" value={currentUser.email} disabled className="disabled-input" />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter phone number" 
              />
            </div>

            <div className="addresses-section">
              <div className="addresses-header">
                <h3>Saved Addresses</h3>
                <button type="button" className="add-address-btn" onClick={() => setShowAddAddress(!showAddAddress)}>
                  {showAddAddress ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {addresses.length === 0 && !showAddAddress && (
                <p className="no-address">No addresses saved yet.</p>
              )}

              <div className="addresses-list">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="address-card">
                    <p><strong>{addr.street}</strong></p>
                    <p>{addr.city}, {addr.state} {addr.zip}</p>
                    <p>{addr.country}</p>
                    <button type="button" className="remove-address-btn" onClick={() => handleRemoveAddress(idx)}>Remove</button>
                  </div>
                ))}
              </div>

              {showAddAddress && (
                <div className="new-address-form">
                  <h4>New Address</h4>
                  <input type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                  <div className="input-row">
                    <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                    <input type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                  </div>
                  <div className="input-row">
                    <input type="text" placeholder="ZIP Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                    <input type="text" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                  </div>
                  <button type="button" className="save-address-btn" onClick={handleAddAddress}>Save Address to List</button>
                </div>
              )}
            </div>

            <button type="submit" className="save-profile-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save All Changes'}
            </button>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
