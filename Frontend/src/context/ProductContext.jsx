import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // We will install axios in the frontend

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Use environment variable for the API URL, fallback to localhost for development
                const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
                const response = await axios.get(`${apiUrl}/api/products`);
                setProducts(response.data);
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
