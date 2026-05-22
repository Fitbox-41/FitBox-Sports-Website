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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  const signup = async (email, password, name = 'User') => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/register`, { name, email, password });
      localStorage.setItem('fitbox_token', data.token);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      localStorage.setItem('fitbox_token', data.token);
      setCurrentUser(data);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
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
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to authenticate with Google');
    }
  };

  const logout = () => {
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
    signup,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
    deleteAccount,
    showLoginModal,
    setShowLoginModal
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
