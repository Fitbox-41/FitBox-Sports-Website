import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import localProducts from '../data/products';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(Array.isArray(localProducts) && localProducts.length > 0 ? localProducts : []);
    const [loading, setLoading] = useState(!(Array.isArray(localProducts) && localProducts.length > 0));
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
                const response = await axios.get(`${apiUrl}/api/products`);
                if (Array.isArray(response.data) && response.data.length > 0) {
                    setProducts(response.data);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
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
