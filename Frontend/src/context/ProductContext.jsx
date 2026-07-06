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
                    // Build a lookup from local products by numeric id
                    const localMap = new Map(localProducts.map(p => [p.id, p]));

                    // Deep-merge: backend wins for _id / price / stock, but we
                    // patch in local image arrays wherever the backend copy is empty
                    const mergedBackend = response.data.map(bp => {
                        const local = localMap.get(bp.id);
                        if (!local) return bp;

                        // Merge variants: keep backend variant data but fall back to
                        // local images if the backend variant has an empty images array
                        const mergedVariants = (bp.variants && bp.variants.length > 0
                            ? bp.variants
                            : local.variants || []
                        ).map((bv, idx) => {
                            const lv = (local.variants || [])[idx] || {};
                            return {
                                ...bv,
                                images: (bv.images && bv.images.length > 0)
                                    ? bv.images
                                    : (lv.images || []),
                            };
                        });

                        return {
                            ...bp,
                            variants: mergedVariants,
                            imgSrc: bp.imgSrc || local.imgSrc || '',
                            hoverImgSrc: bp.hoverImgSrc || local.hoverImgSrc || '',
                            showcaseImages: (bp.showcaseImages && bp.showcaseImages.length > 0)
                                ? bp.showcaseImages
                                : (local.showcaseImages || []),
                        };
                    });

                    // Also keep any local-only products not yet in the backend
                    const backendIds = new Set(response.data.map(p => p.id));
                    const localOnly = localProducts.filter(p => !backendIds.has(p.id));

                    setProducts([...mergedBackend, ...localOnly]);
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
