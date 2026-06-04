import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutRibbon, setShowLogoutRibbon] = useState(false);
  const [showLoginSuccessRibbon, setShowLoginSuccessRibbon] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('fitbox_token');
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get(`${apiUrl}/api/auth/profile`, config);
          setCurrentUser(data);
        } catch (error) {
          console.error('Error fetching profile:', error);
          localStorage.removeItem('fitbox_token');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [apiUrl]);

  const requestOtpForRegister = async (email, password, name = 'User') => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/pre-register`, { name, email, password });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to request OTP');
    }
  };

  const signup = async (email, password, otp, name = 'User') => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/register`, { name, email, password, otp });
      localStorage.setItem('fitbox_token', data.token);
      setCurrentUser(data);
      triggerLoginSuccessRibbon();
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  };

  const requestOtpForLogin = async (email, password) => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/pre-login`, { email, password });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to request OTP');
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      localStorage.setItem('fitbox_token', data.token);
      setCurrentUser(data);
      triggerLoginSuccessRibbon();
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  };

  const requestForgotPasswordOtp = async (email) => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/forgot-password-otp`, { email });
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset OTP');
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/verify-reset-otp`, { email, otp });
      localStorage.setItem('fitbox_token', data.token);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const triggerLoginSuccessRibbon = () => {
    setShowLoginSuccessRibbon(true);
    setTimeout(() => setShowLoginSuccessRibbon(false), 3000);
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const { data } = await axios.post(`${apiUrl}/api/auth/google`, { 
        name: user.displayName || 'Google User', 
        email: user.email 
      });
      
      localStorage.setItem('fitbox_token', data.token);
      setCurrentUser(data);
      triggerLoginSuccessRibbon();
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to authenticate with Google');
    }
  };

  const logout = () => {
    setShowLogoutRibbon(true);
    setTimeout(() => setShowLogoutRibbon(false), 3000);
    localStorage.removeItem('fitbox_token');
    setCurrentUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('fitbox_token');
      if (!token) throw new Error('Not authenticated');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(`${apiUrl}/api/auth/profile`, profileData, config);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const updatePassword = async (password) => {
    try {
      const token = localStorage.getItem('fitbox_token');
      if (!token) throw new Error('Not authenticated');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(`${apiUrl}/api/auth/password`, { password }, config);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update password');
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('fitbox_token');
      if (!token) throw new Error('Not authenticated');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${apiUrl}/api/auth/profile`, config);
      logout();
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const value = {
    currentUser,
    requestOtpForRegister,
    requestOtpForLogin,
    signup,
    login,
    loginWithGoogle,
    requestForgotPasswordOtp,
    verifyResetOtp,
    updatePassword,
    logout,
    updateProfile,
    deleteAccount,
    showLoginModal,
    setShowLoginModal,
    triggerLoginSuccessRibbon
  };

  return (
    <AuthContext.Provider value={value}>
      <div className={`toast-ribbon ${showLogoutRibbon ? 'show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Signing out...
      </div>
      <div className={`toast-ribbon ${showLoginSuccessRibbon ? 'show' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Successfully logged in!
      </div>
      {!loading && children}
    </AuthContext.Provider>
  );
};
