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

                        // Merge variants: Local wins for structure (color, images, sizes names),
                        // but Backend wins for price, oldPrice (mrp), and weight.
                        const mergedVariants = (local.variants && local.variants.length > 0
                            ? local.variants
                            : bp.variants || []
                        ).map((lv, idx) => {
                            const bv = (bp.variants || [])[idx] || {};
                            
                            const mergedSizes = (lv.sizes && lv.sizes.length > 0 ? lv.sizes : bv.sizes || []).map((ls, sIdx) => {
                                const bs = (bv.sizes || [])[sIdx] || {};
                                return {
                                    ...ls, // Local name and details
                                    // Backend wins for pricing and weight
                                    price: bs.price !== undefined ? bs.price : ls.price,
                                    oldPrice: bs.oldPrice !== undefined ? bs.oldPrice : ls.oldPrice,
                                    weight: bs.weight !== undefined ? bs.weight : ls.weight,
                                };
                            });

                            return {
                                ...bv, // Keep backend info (e.g. stock, id)
                                ...lv, // Local overrides color, images
                                sizes: mergedSizes,
                            };
                        });

                        return {
                            ...bp, // Keep backend info
                            name: local.name || bp.name, // Local name wins
                            variants: mergedVariants,
                            imgSrc: local.imgSrc || bp.imgSrc || '', // Local images win
                            hoverImgSrc: local.hoverImgSrc || bp.hoverImgSrc || '',
                            showcaseImages: (local.showcaseImages && local.showcaseImages.length > 0)
                                ? local.showcaseImages
                                : (bp.showcaseImages || []),
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
