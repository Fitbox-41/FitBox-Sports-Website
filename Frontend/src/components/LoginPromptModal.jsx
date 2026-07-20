import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Gift } from 'lucide-react';
import products from '../data/products';
import './LoginPromptModal.css';

// Extract product images for the slideshow
const PRODUCT_IMAGES = products.slice(0, 5).map(p => p.imgSrc).filter(Boolean);

// Flash cards text data
const FLASH_CARDS = [
  {
    title: 'Unlock 10% Off Your First Order!',
    description: 'Join FitBox Sports today and get an exclusive discount on all premium gym equipment.',
  },
  {
    title: 'Exclusive Member Deals Inside!',
    description: 'Log in now to access members-only discounts, early sales, and free shipping offers.',
  },
  {
    title: 'Level Up Your Home Gym',
    description: 'Create an account to track your orders, save favorites, and build your dream setup.',
  },
  {
    title: "Don't Miss Out on Flash Sales",
    description: 'Sign in to get notified about our biggest discounts and limited-time offers.',
  },
  {
    title: 'Your Fitness Journey Starts Here',
    description: 'Log in to join the FitBox community and get personalized equipment recommendations.',
  }
];

const LoginPromptModal = () => {
  const { currentUser, loginWithGoogle } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [cardContent, setCardContent] = useState(FLASH_CARDS[0]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // If user is already logged in, do not show the modal
    if (currentUser) {
      setIsOpen(false);
      return;
    }

    // Do not show on auth page
    if (location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup') {
      setIsOpen(false);
      return;
    }

    // Set interval to show modal
    const interval = setInterval(() => {
      // Check if not logged in, not already open, and not on auth pages
      const overlay = document.querySelector('.login-prompt-overlay');
      const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup';
      
      if (!currentUser && !overlay && !isAuthPage) {
        const randomIndex = Math.floor(Math.random() * FLASH_CARDS.length);
        setCardContent(FLASH_CARDS[randomIndex]);
        setIsOpen(true);
      }
    }, 90000); // 90 seconds

    return () => clearInterval(interval);
  }, [currentUser, location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e) => {
    // Close if clicking outside the modal content
    if (e.target.className === 'login-prompt-overlay') {
      handleClose();
    }
  };

  // Prevent background scrolling while modal is open
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

  // Slideshow logic
  useEffect(() => {
    if (!isOpen || PRODUCT_IMAGES.length === 0) return;
    
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % PRODUCT_IMAGES.length);
    }, 2000); // Swap every 2 seconds
    
    return () => clearInterval(imageTimer);
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      handleClose();
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  if (!isOpen || currentUser) return null;

  return (
    <div className="login-prompt-overlay" onClick={handleBackdropClick}>
      <div className="login-prompt-modal">
        <button className="login-prompt-close" onClick={handleClose}>
          <X size={24} />
        </button>
        
        <div className="login-prompt-content">
          <div className="login-prompt-image-container">
            {PRODUCT_IMAGES.length > 0 && (
              <img 
                key={currentImageIndex} /* Force re-render for animation */
                src={PRODUCT_IMAGES[currentImageIndex]} 
                alt="Product" 
                className="login-prompt-slideshow-img" 
              />
            )}
          </div>
          
          <div className="login-prompt-text-section">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            
            <div className="login-prompt-badge">
              <Gift size={14} className="badge-icon" />
              <span>Limited Time Offer</span>
            </div>
            <h2 className="login-prompt-title">{cardContent.title}</h2>
            <p className="login-prompt-desc">{cardContent.description}</p>
            
            <button 
              type="button" 
              className="login-prompt-google-btn" 
              onClick={handleGoogleLogin}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
