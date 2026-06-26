import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { currentUser, setShowLoginModal } = useAuth();
  
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('fitbox_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('fitbox_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

  // Load cart/wishlist from server when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.cart) setCart(currentUser.cart);
      if (currentUser.wishlist) setWishlist(currentUser.wishlist);
    } else {
      // If logged out, clear cart
      setCart([]);
      setWishlist([]);
    }
  }, [currentUser]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('fitbox_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fitbox_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync to server function
  const syncWithServer = async (newCart, newWishlist) => {
    if (!currentUser) return;
    const token = localStorage.getItem('fitbox_token');
    if (!token) return;

    try {
      await axios.put(
        `${apiUrl}/api/auth/sync`,
        {
          cart: newCart !== undefined ? newCart : cart,
          wishlist: newWishlist !== undefined ? newWishlist : wishlist
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to sync with server', err);
    }
  };

  const normalizeSelectedSize = (size) => {
    if (size === null || size === undefined) return '';
    if (typeof size === 'string') return size.trim() || 'STANDARD';
    if (typeof size === 'number') return size > 0 ? String(size) : 'STANDARD';
    if (typeof size === 'object') {
      return size.name || size.label || (size.price ? `₹${size.price}` : '') || 'STANDARD';
    }
    return 'STANDARD';
  };

  const normalizeSelectedVariant = (variant) => {
    if (!variant) return '';
    if (typeof variant === 'string') return variant;
    if (typeof variant === 'object') {
      return variant.color || variant.name || variant.label || variant._id?.toString() || '';
    }
    return String(variant);
  };

  const addToCart = (product) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    const qtyToAdd = product.quantity || 1;
    const normalizedProduct = {
      ...product,
      selectedVariant: normalizeSelectedVariant(product.selectedVariant),
      selectedSize: normalizeSelectedSize(product.selectedSize)
    };
    let newCart;
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => 
        item.id === normalizedProduct.id && item.selectedVariant === normalizedProduct.selectedVariant
      );
      if (existingItem) {
        alert("This item is already in your cart!");
        newCart = prevCart; // Do not add again
      } else {
        newCart = [...prevCart, { ...normalizedProduct, quantity: qtyToAdd }];
      }
      return newCart;
    });

    if (newCart !== cart) {
      setTimeout(() => syncWithServer(newCart, undefined), 0);
    }
  };

  const removeFromCart = (productId, variant) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    let newCart;
    setCart((prevCart) => {
      newCart = prevCart.filter((item) => 
        !(item.id === productId && item.selectedVariant === variant)
      );
      return newCart;
    });
    setTimeout(() => syncWithServer(newCart, undefined), 0);
  };

  const updateQuantity = (productId, variant, delta) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    let newCart;
    setCart((prevCart) => {
      newCart = prevCart.map((item) =>
        (item.id === productId && item.selectedVariant === variant)
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      return newCart;
    });
    setTimeout(() => syncWithServer(newCart, undefined), 0);
  };

  const toggleWishlist = (product) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }

    let newWishlist;
    setWishlist((prev) => {
      const isExist = prev.find(item => item.id === product.id);
      if (isExist) {
        newWishlist = prev.filter(item => item.id !== product.id);
      } else {
        newWishlist = [...prev, product];
      }
      return newWishlist;
    });
    setTimeout(() => syncWithServer(undefined, newWishlist), 0);
  };

  const clearCart = () => {
    setCart([]);
    setTimeout(() => syncWithServer([], undefined), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      wishlist, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleWishlist,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
