import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Plus, Trash2, AlertTriangle, Save } from 'lucide-react';
import './Account.css';

export default function Account() {
  const { currentUser, updateProfile, deleteAccount } = useAuth();
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

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="account-page">
      <Header />
      <div className="header-spacer" style={{ height: '110px' }} />

      <div className={`toast-ribbon ${successMsg ? 'show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {successMsg || 'Profile updated successfully!'}
      </div>

      <div className="account-container">
        <div className="account-header-section">
          <h1 className="account-title">Personal Details</h1>
          <p className="account-subtitle">Manage your personal information and addresses</p>
        </div>
        
        {errorMsg && <div className="account-error">{errorMsg}</div>}

        <div className="account-card">
          <form className="account-form" onSubmit={handleSaveProfile}>
            
            <div className="form-group">
              <label><Mail size={16} /> Email Address <span className="label-note">(Cannot be changed)</span></label>
              <input type="email" value={currentUser.email} disabled className="disabled-input" />
            </div>

            <div className="form-group">
              <label><User size={16} /> Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label><Phone size={16} /> Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter phone number" 
              />
            </div>

            <div className="addresses-section">
              <div className="addresses-header">
                <h3><MapPin size={18} /> Saved Addresses</h3>
                <button type="button" className="add-address-btn" onClick={() => setShowAddAddress(!showAddAddress)}>
                  {showAddAddress ? 'Cancel' : <><Plus size={16} /> Add Address</>}
                </button>
              </div>

              {addresses.length === 0 && !showAddAddress && (
                <div className="no-address-box">
                  <MapPin size={32} strokeWidth={1} />
                  <p>No addresses saved yet.</p>
                </div>
              )}

              <div className="addresses-list">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="address-card">
                    <div className="address-card-content">
                      <p className="address-street">{addr.street}</p>
                      <p className="address-city">{addr.city}, {addr.state} {addr.zip}</p>
                      <p className="address-country">{addr.country}</p>
                    </div>
                    <button type="button" className="remove-address-btn" onClick={() => handleRemoveAddress(idx)} title="Remove Address">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {showAddAddress && (
                <div className="new-address-form">
                  <h4><Plus size={16} /> New Address Details</h4>
                  <div className="form-group">
                    <input type="text" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                  </div>
                  <div className="input-row">
                    <div className="form-group">
                      <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="form-group">
                      <input type="text" placeholder="ZIP Code" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <input type="text" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                    </div>
                  </div>
                  <button type="button" className="save-address-btn" onClick={handleAddAddress}>Save Address</button>
                </div>
              )}
            </div>

            <button type="submit" className="save-profile-btn" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={18} /> Save All Changes</>}
            </button>
          </form>

          <div className="danger-zone">
            <h3><AlertTriangle size={18} /> Account Deletion</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              type="button" 
              className="delete-account-btn" 
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
