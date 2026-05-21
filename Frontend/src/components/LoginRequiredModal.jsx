import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginRequiredModal.css';

export default function LoginRequiredModal() {
  const { showLoginModal, setShowLoginModal } = useAuth();
  const navigate = useNavigate();

  if (!showLoginModal) return null;

  const handleLoginClick = () => {
    setShowLoginModal(false);
    navigate('/auth');
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-card">
        <h2>Authentication Required</h2>
        <p>You need to be signed in to add items to your cart or wishlist.</p>
        <div className="login-modal-actions">
          <button className="login-modal-btn" onClick={handleLoginClick}>
            Go to Login / Sign Up
          </button>
          <button className="login-modal-cancel" onClick={() => setShowLoginModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
