import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import localProducts from '../data/products';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    // Seed with local static data immediately so every section renders on first paint
    const [products, setProducts] = useState(localProducts);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Use environment variable for the API URL, fallback to localhost for development
                const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
                const response = await axios.get(`${apiUrl}/api/products`);
                // Only replace if the API returned actual data
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setProducts(response.data);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <ProductContext.Provider value={{ products, loading, error }}>
            {children}
        </ProductContext.Provider>
    );
};
