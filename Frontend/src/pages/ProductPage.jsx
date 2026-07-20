import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ProductPage.css';
import axios from 'axios';
import CheckoutModal from '../components/CheckoutModal';
import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';
const MobileRelatedRow = ({ products }) => {
  const [idx, setIdx] = useState(products.length);
  const [trans, setTrans] = useState(true);
  const [busy, setBusy] = useState(false);

  const next = () => {
    if (busy) return;
    setBusy(true);
    setIdx((p) => p + 1);
    setTimeout(() => setBusy(false), 550);
  };
  const prev = () => {
    if (busy) return;
    setBusy(true);
    setIdx((p) => p - 1);
    setTimeout(() => setBusy(false), 550);
  };

  useEffect(() => {
    if (idx >= products.length * 2) {
      setTimeout(() => { setTrans(false); setIdx(products.length); }, 500);
    }
    if (idx < products.length) {
      setTimeout(() => { setTrans(false); setIdx(products.length * 2 - 1); }, 500);
    }
  }, [idx, products.length]);

  useEffect(() => {
    if (!trans) {
      const timer = setTimeout(() => setTrans(true), 20);
      return () => clearTimeout(timer);
    }
  }, [trans]);

  const startX = useRef(0);
  const handleTouchStart = (e) => (startX.current = e.touches[0].pageX);
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    if (startX.current - endX > 50) next();
    if (endX - startX.current > 50) prev();
  };

  return (
    <div className="v2-mobile-row-wrapper">
      <div
        className="v2-carousel-track-simple"
        style={{
          transform: `translateX(calc(-${idx} * 46%))`,
          transition: trans ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          display: 'flex',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {[...products, ...products, ...products].map((rp, i) => (
          <div className="v2-mobile-carousel-item" key={`${rp.id}-${i}`} style={{ flex: '0 0 46%', padding: '0 6px', boxSizing: 'border-box' }}>
            <Link to={`/product/${rp.id}`} className="v2-product-card-link">
              <div className="v2-product-card">
                <div className="card-img-wrap">
                  <img src={rp.image} alt={rp.name} loading="lazy" decoding="async" />
                </div>
                <div className="card-info">
                  <h4 className="card-title">{rp.name}</h4>
                  <div className="card-pricing">
                    <span className="price-now">₹{rp.price}</span>
                    <span className="price-was">₹{rp.oldPrice}</span>
                  </div>
                  <p className="card-discount">{Math.round((1 - rp.price / rp.oldPrice) * 100)}% OFF</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductPage() {
  const { products: allProducts, loading, refreshProducts } = useContext(ProductContext);
  // ─── 1. State & Data Logic ───
  const { addToCart } = useCart();
  const { currentUser, setShowLoginModal } = useAuth();
  const { deliveryFee, freeDeliveryThreshold } = useSettings();
  const navigate = useNavigate();
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buyNowDeliveryFee, setBuyNowDeliveryFee] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  // useParams retrieves the :productId from the URL (e.g., /product/1)
  const { productId } = useParams();

  // Local state for the current product data
  const product = allProducts.find((p) => p.id === Number(productId));



  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const normalizeSizeLabel = (size) => {
    if (size === null || size === undefined) return '';
    if (typeof size === 'string') {
      return size.trim() || 'STANDARD';
    }
    if (typeof size === 'number') {
      return size > 0 ? String(size) : 'STANDARD';
    }
    if (typeof size === 'object') {
      const normalized = (size.name || size.label || `${size.price ? `₹${size.price}` : ''}`).trim();
      return normalized || 'STANDARD';
    }
    return 'STANDARD';
  };

  const getShortSize = (sizeStr) => {
    if (!sizeStr) return sizeStr;
    const s = sizeStr.toString().trim().toLowerCase();
    if (s === 'small') return 'S';
    if (s === 'medium') return 'M';
    if (s === 'large') return 'L';
    if (s === 'x-large' || s === 'xlarge') return 'XL';
    if (s === 'xx-large' || s === 'xxlarge') return 'XXL';
    if (s === 'xxx-large' || s === 'xxxlarge') return 'XXXL';
    return sizeStr;
  };

  const normalizeVariantLabel = (variant) => {
    if (!variant) return '';
    if (typeof variant === 'string') return variant;
    if (typeof variant === 'object') {
      return variant.color || variant.name || variant.label || variant._id?.toString() || '';
    }
    return String(variant);
  };

  // Interaction states: which variant (color), size, and image are currently active
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  useEffect(() => {
    // Scroll to top on page entry
    window.scrollTo(0, 0);
    setQuantity(1); // Reset quantity on product/variant change
  }, [productId, allProducts]);

  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // Reviews States
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewImagePreviews, setReviewImagePreviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [activeReviewImage, setActiveReviewImage] = useState(null);
  const [viewAllPhotosModalOpen, setViewAllPhotosModalOpen] = useState(false);
  const [showWriteReviewForm, setShowWriteReviewForm] = useState(false);
  const [lightboxImagesList, setLightboxImagesList] = useState([]);
  const [activeLightboxImageIdx, setActiveLightboxImageIdx] = useState(0);
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null);
  const [localReviews, setLocalReviews] = useState([]);

  useEffect(() => {
    if (product) {
      setLocalReviews(product.reviews || []);
    }
  }, [product, allProducts]);

  useEffect(() => {
    return () => {
      reviewImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [reviewImagePreviews]);

  const handleReviewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const nonImages = files.filter(f => !f.type.startsWith('image/'));
    if (nonImages.length > 0) {
      setReviewError('Only image files are allowed!');
      return;
    }
    setReviewError('');
    setReviewImages(prev => [...prev, ...files].slice(0, 5));
    const previews = files.map(file => URL.createObjectURL(file));
    setReviewImagePreviews(prev => [...prev, ...previews].slice(0, 5));
  };

  const handleRemoveReviewImage = (idx) => {
    setReviewImages(prev => prev.filter((_, i) => i !== idx));
    setReviewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      setReviewError('Please select a star rating.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }
    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess(false);
    try {
      const formData = new FormData();
      formData.append('rating', reviewRating);
      formData.append('title', reviewTitle);
      formData.append('comment', reviewComment);
      reviewImages.forEach(file => {
        formData.append('images', file);
      });
      const token = localStorage.getItem('fitbox_token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const response = await axios.post(`${apiUrl}/api/products/${product.id}/reviews`, formData, config);
      if (response.status === 201) {
        setReviewSuccess(true);
        setReviewRating(0);
        setReviewTitle('');
        setReviewComment('');
        setReviewImages([]);
        setReviewImagePreviews([]);
        setShowWriteReviewForm(false);
        
        const section = document.querySelector('.v2-reviews-section');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }

        if (response.data.reviews) {
          setLocalReviews(response.data.reviews);
          product.reviews = response.data.reviews;
        }
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review? This action is permanent.')) return;
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const response = await axios.delete(`${apiUrl}/api/products/${product.id}/reviews/${reviewId}`, config);
      if (response.status === 200) {
        if (response.data.reviews) {
          setLocalReviews(response.data.reviews);
          product.reviews = response.data.reviews;
        }
      }
    } catch (err) {
      console.error('Delete review error:', err);
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const handleHelpfulClick = async (e, reviewId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const response = await axios.post(`${apiUrl}/api/products/${product.id}/reviews/${reviewId}/helpful`, {}, config);
      if (response.status === 200) {
        if (response.data.reviews) {
          setLocalReviews(response.data.reviews);
          product.reviews = response.data.reviews;
        }
      }
    } catch (err) {
      console.error('Helpful click error:', err);
      alert(err.response?.data?.message || 'Failed to update helpful status.');
    }
  };

  const nextLightboxImage = () => {
    if (lightboxImagesList.length === 0) return;
    setActiveLightboxImageIdx((prevIdx) => (prevIdx + 1) % lightboxImagesList.length);
  };

  const prevLightboxImage = () => {
    if (lightboxImagesList.length === 0) return;
    setActiveLightboxImageIdx((prevIdx) => (prevIdx - 1 + lightboxImagesList.length) % lightboxImagesList.length);
  };

  const swipeStartX = useRef(0);
  const handleLightboxTouchStart = (e) => {
    swipeStartX.current = e.touches[0].pageX;
  };
  const handleLightboxTouchEnd = (e) => {
    const endX = e.changedTouches[0].pageX;
    const diff = swipeStartX.current - endX;
    if (diff > 50) {
      nextLightboxImage();
    } else if (diff < -50) {
      prevLightboxImage();
    }
  };

  const customerImagesGridRef = useRef(null);
  const scrollCustomerImages = (direction) => {
    if (customerImagesGridRef.current) {
      const scrollAmount = 220;
      customerImagesGridRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // ─── 2. RELATED PRODUCTS LOGIC ───
  let relatedProducts = [];
  
  if (product?.relatedIds && product.relatedIds.length > 0) {
    // 1. Get the exact products the user manually specified in products.js
    relatedProducts = allProducts.filter(p => product.relatedIds.includes(p.id));
    
    // 2. If they specified fewer than 10, automatically fill the rest so the UI stays perfect
    if (relatedProducts.length < 10) {
      const extraProducts = allProducts.filter(p => p.id !== parseInt(productId) && !product.relatedIds.includes(p.id));
      relatedProducts = [...relatedProducts, ...extraProducts].slice(0, 10);
    }
  } else {
    // Fallback: just get 10 other products automatically
    relatedProducts = allProducts
      .filter(p => p.id !== parseInt(productId))
      .slice(0, 10);
  }

  relatedProducts = relatedProducts.map((p, index) => {
    const v = p.variants?.[0] || {};
    const s = v.sizes?.[0] || null;
    const price = s?.price ?? v.price ?? p.price ?? 0;
    const oldPrice = s?.oldPrice ?? v.oldPrice ?? p.oldPrice ?? 0;
    return {
      ...p,
      price,
      oldPrice,
      id: p.id,
      /* ── 3. RELATED PRODUCT THUMBNAILS ── */
      image: p.variants && p.variants[0] && p.variants[0].images ? p.variants[0].images[0] : p.imgSrc || p.image || ''
    };
  });

  const relatedChunks = [];
  for (let i = 0; i < relatedProducts.length; i += 5) {
    relatedChunks.push(relatedProducts.slice(i, i + 5));
  }

  const titleRef = useRef(null);

  // ─── 3. Data Loading Effect ───
  useEffect(() => {
    // Scroll reveal observer for the "You may also like" title
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    }, { threshold: 0.1 });

    if (titleRef.current) observer.observe(titleRef.current);

    // Clean up observer on component unmount
    return () => observer.disconnect();
  }, []);

  // ─── RECENTLY VIEWED LOGIC ───
  useEffect(() => {
    if (!productId) return;
    const currentId = parseInt(productId);
    
    // Retrieve array from localStorage
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Get the products to display (excluding the current one, top 4)
    const recentIds = viewed.filter(id => id !== currentId).slice(0, 4);
    const recentProducts = allProducts
      .filter(p => recentIds.includes(p.id))
      .map(p => {
        const v = p.variants?.[0] || {};
        const s = v.sizes?.[0] || null;
        const price = s?.price ?? v.price ?? p.price ?? 0;
        const oldPrice = s?.oldPrice ?? v.oldPrice ?? p.oldPrice ?? 0;
        return {
          ...p,
          price,
          oldPrice,
          image: p.variants && p.variants[0] && p.variants[0].images ? p.variants[0].images[0] : p.imgSrc || p.image || ''
        };
      });
    setRecentlyViewedProducts(recentProducts);

    // Update localStorage
    viewed = viewed.filter(id => id !== currentId);
    viewed.unshift(currentId);
    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  }, [productId]);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStart.current - touchEnd.current > 50) {
      handleNext();
    }
    if (touchStart.current - touchEnd.current < -50) {
      handlePrev();
    }
  };

  // ── 3. Early return AFTER all hooks ──
  if (loading || !product) return (
    <div className="product-page" style={{ minHeight: '100vh', background: 'var(--bg)' }}></div>
  );


  // ─── 4. Derived State: Current variant data and handlers ───
  const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { images: [], sizes: [] };
  const images = currentVariant.images || [];
  const sizeOptions = Array.isArray(currentVariant.sizes) ? currentVariant.sizes : [];
  const normalizedSizeOptions = sizeOptions
    .map((size, idx) => ({ size, label: normalizeSizeLabel(size), idx }))
    .filter((item) => item.label);
  const showSizeSelector = normalizedSizeOptions.length > 1;
  const isActuallyOutOfStock = product.isOutOfStock || currentVariant.isOutOfStock || (product.stock !== undefined && product.stock <= 0);

  const handleNext = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);



  const handleBuyNow = async () => {
    if (isProcessing) return;
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    if (!currentUser.addresses || currentUser.addresses.length === 0 || !currentUser.phone) {
      alert("Please complete your account details by adding a phone number and shipping address before buying.");
      navigate('/account');
      return;
    }

    setIsProcessing(true);
    try {
      const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { sizes: [] };
      const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;

      const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
      const activeWeight = currentSize?.weight ?? currentVariant?.weight ?? 0;

      const parsePrice = (val) => Number(String(val).replace(/[^0-9.-]+/g,""));
      const parsedActivePrice = parsePrice(activePrice);
      
      const buyNowItem = {
        ...product,
        selectedVariant: normalizeVariantLabel(currentVariant),
        selectedSize: normalizeSizeLabel(currentSize),
        price: parsedActivePrice,
        weight: activeWeight,
        imgSrc: currentVariant?.images[0] || product.imgSrc,
        quantity: quantity
      };
      
      const subtotalAmount = parsedActivePrice * quantity;
      const shippingAmount = subtotalAmount > freeDeliveryThreshold || subtotalAmount === 0 ? 0 : deliveryFee;
      const totalAmount = subtotalAmount + shippingAmount;

      setCheckoutItems([buyNowItem]);
      setCheckoutTotal(totalAmount);
      setBuyNowDeliveryFee(shippingAmount);

      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${apiUrl}/api/orders/place`, { 
        items: [{
          ...buyNowItem,
          id: product._id
        }], 
        totalAmount,
        deliveryCharge: shippingAmount
      }, config);
      
      if (res.data.success) {
        setCurrentOrderId(res.data.orderId);
        setIsCheckoutModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="product-page">
      <Header hideSubHeader={true} hideSaleRibbon={false} />
      {/* Spacer for fixed header (Main header + Sale ribbon = ~111px) */}
      <div className="header-spacer desktop-only-spacer" style={{ height: '111px' }} />

      <main className="product-main container">
        <div className="product-layout">

          {/* ──── LEFT SECTION: Image Gallery ──── */}
          <div className="product-gallery-v2">
            <div
              className="main-image-viewport"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <button className="nav-arrow left-arrow" onClick={handlePrev}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              <button className="fullscreen-expand-btn" onClick={() => setIsFullscreen(true)} title="View full screen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                  <path d="M15 3h6v6"></path>
                  <path d="M9 21H3v-6"></path>
                  <path d="M21 3l-7 7"></path>
                  <path d="M3 21l7-7"></path>
                </svg>
              </button>

              <div className="image-track" style={{ transform: `translateX(-${currentImgIdx * 100}%)` }}>
                {images.map((img, idx) => (
                  <div key={idx} className="gallery-main-img-wrap">
                    {/* Rendering MAIN PRODUCT IMAGES */}
                    <img src={img} alt={`${product.name} - ${idx}`} className="gallery-main-img" loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>

              <button className="nav-arrow right-arrow" onClick={handleNext}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            <div className="thumb-strip-v2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-item-v2 ${currentImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setCurrentImgIdx(idx)}
                >
                  <img src={img} alt="thumbnail" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>

          {/* ──── RIGHT SECTION: Product Details ──── */}
          <div className="product-info-v2">
            <div className="v2-breadcrumb" style={{ marginBottom: '12px', fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Home</Link>
              {product.category && (
                <>
                  <span>&gt;</span>
                  <Link to={`/category/${product.category.trim().replace(/\s+/g, '-').toLowerCase()}`} style={{ color: '#666', textDecoration: 'none' }}>
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()}
                  </Link>
                </>
              )}
              {product.subCategory && (
                <>
                  <span>&gt;</span>
                  <Link to={`/category/${product.subCategory.trim().replace(/\s+/g, '-').toLowerCase()}`} style={{ color: '#666', textDecoration: 'none' }}>
                    {product.subCategory.charAt(0).toUpperCase() + product.subCategory.slice(1).toLowerCase()}
                  </Link>
                </>
              )}
            </div>
            <span className="v2-brand-tag">FitBox Sports </span>
            <h1 className="v2-product-title">
              {product.name}
              {(() => {
                const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { sizes: [] };
                const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;
                const colorStr = currentVariant?.color ? ` - ${normalizeVariantLabel(currentVariant)}` : '';
                const sizeStr = currentSize ? ` - ${normalizeSizeLabel(currentSize)}` : '';
                return `${colorStr}${sizeStr}`;
              })()}
              {product.isNew && (
                <span className="ml-3 inline-block px-3 py-1 bg-[#ff6b35] text-white text-[0.65rem] font-bold uppercase tracking-wider rounded-full align-middle">
                  New Arrival
                </span>
              )}
            </h1>
            <div className="v2-qualities">
              {product.qualities.map((q, i) => (
                <span key={i}>
                  {q}{i < product.qualities.length - 1 ? ' | ' : ''}
                </span>
              ))}
            </div>

            <div className="v2-price-box">
              {(() => {
                const currentVariant = (product.variants && product.variants[selectedVariantIdx]) || (product.variants && product.variants[0]) || { sizes: [] };
                const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;
                const parsePrice = (val) => Number(String(val).replace(/[^0-9.-]+/g,""));
                const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
                const activeOldPrice = currentSize?.oldPrice ?? currentVariant?.oldPrice ?? product.oldPrice ?? 0;
                const parsedActivePrice = parsePrice(activePrice);
                const parsedOldPrice = parsePrice(activeOldPrice);
                return (
                  <>
                    <span className="v2-current-price">₹{parsedActivePrice * quantity}</span>
                    <span className="v2-old-price">₹{parsedOldPrice * quantity}</span>
                    <span className="v2-save-tag">You Saved ₹{(parsedOldPrice - parsedActivePrice) * quantity}</span>
                  </>
                );
              })()}
            </div>

            {/* COLOR SELECTOR */}
            <div className="v2-selector-wrap">
              <p className="selector-label">Color: <strong>{currentVariant?.color}</strong></p>
              <div className="v2-color-grid">
                {product.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className={`color-pill ${selectedVariantIdx === idx ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedVariantIdx(idx);
                      setSelectedSizeIdx(0);
                      setCurrentImgIdx(0);
                    }}
                  >
                    <img src={variant.images[0]} alt={variant.color || `Color ${idx}`} loading="lazy" decoding="async" />
                    {variant.price && variant.price !== product.price && (
                       <span style={{ fontSize: '10px', display: 'block', textAlign: 'center' }}>₹{variant.price}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            {showSizeSelector && (
              <div className="v2-selector-wrap">
                <p className="selector-label">Size</p>
                <div className="v2-size-grid">
                  {normalizedSizeOptions.map(({ size, label, idx }) => (
                    <div
                      key={idx}
                      className={`size-pill ${selectedSizeIdx === idx ? 'selected' : ''}`}
                      onClick={() => setSelectedSizeIdx(idx)}
                      title={label}
                    >
                      <span>{getShortSize(label)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div className="v2-selector-wrap">
              <p className="selector-label">Quantity</p>
              <div className="v2-qty-ribbon">
                <button 
                  className="qty-btn" 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span className="qty-value">{quantity}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* URGENCY MESSAGE / OUT OF STOCK */}
            {isActuallyOutOfStock ? (
              <div className="v2-urgency-banner v2-out-of-stock-banner">
                <div className="urgency-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ color: '#1a1a2e' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className="urgency-text" style={{ color: '#1a1a2e' }}>This variant is currently out of stock.</p>
              </div>
            ) : (product.stock !== undefined && product.stock < 10) ? (
              <div className="v2-urgency-banner">
                <div className="urgency-icon-wrap">
                  <span className="blink-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" style={{ color: '#c53030' }}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </span>
                </div>
                <p className="urgency-text">Only {product.stock} products left. Hurry!</p>
              </div>
            ) : null}

            {/* ACTION BUTTONS */}
            <div className="v2-action-buttons">
              <button 
                className={`v2-btn v2-btn-cart ${isActuallyOutOfStock ? 'v2-btn--disabled' : ''}`}
                disabled={isActuallyOutOfStock}
                onClick={() => {
                  const currentSize = currentVariant?.sizes && currentVariant.sizes[selectedSizeIdx] ? currentVariant.sizes[selectedSizeIdx] : null;
                  const parsePrice = (val) => Number(String(val).replace(/[^0-9.-]+/g,""));
                  const activePrice = currentSize?.price ?? currentVariant?.price ?? product.price ?? 0;
                  const parsedActivePrice = parsePrice(activePrice);
                  const activeWeight = currentSize?.weight ?? currentVariant?.weight ?? 0;
                  
                  addToCart({
                    ...product,
                    selectedVariant: normalizeVariantLabel(currentVariant),
                    selectedSize: normalizeSizeLabel(currentSize),
                    price: parsedActivePrice,
                    weight: activeWeight,
                    imgSrc: currentVariant?.images[0] || product.imgSrc,
                    quantity: quantity
                  });
                }}
              >
                {isActuallyOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                className={`v2-btn v2-btn-buy ${isActuallyOutOfStock || isProcessing ? 'v2-btn--disabled' : ''}`}
                disabled={isActuallyOutOfStock || isProcessing}
                onClick={handleBuyNow}
              >
                {isActuallyOutOfStock ? 'Out of Stock' : isProcessing ? 'Processing...' : 'Buy Now'}
              </button>
            </div>

            <div className="v2-description">
              <h3>About Product</h3>
              {product.features ? (
                <ul className="v2-features-list">
                  {product.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p>{product.aboutText || product.longDesc}</p>
              )}
            </div>
          </div> {/* End of product-info-v2 */}
        </div> {/* End of product-layout */}

      </main>

      {/* Description & Material Section */}
      <div className="v2-product-long-details" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto 40px', padding: '0 20px', boxSizing: 'border-box' }}>
        
        {/* Description Accordion Row */}
        <div className="accordion-item-details" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>
          <button 
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'none', 
              border: 'none', 
              padding: '10px 0', 
              cursor: 'pointer', 
              textAlign: 'left'
            }}
          >
            <h3 className="details-section-title" style={{ margin: 0 }}>Description</h3>
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--secondary)" 
              strokeWidth="2.5" 
              width="18" 
              height="18"
              style={{ transform: isDescriptionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {isDescriptionOpen && (
            <div className="details-section-content" style={{ marginTop: '10px' }}>
              <p className="details-section-text" style={{ margin: 0 }}>{product.longDesc}</p>
            </div>
          )}
        </div>

        {/* Material Used Accordion Row */}
        {product.material && (
          <div className="accordion-item-details" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>
            <button 
              onClick={() => setIsMaterialOpen(!isMaterialOpen)}
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'none', 
                border: 'none', 
                padding: '10px 0', 
                cursor: 'pointer', 
                textAlign: 'left'
              }}
            >
              <h3 className="details-section-title" style={{ margin: 0 }}>Material Used</h3>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="var(--secondary)" 
                strokeWidth="2.5" 
                width="18" 
                height="18"
                style={{ transform: isMaterialOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {isMaterialOpen && (
              <div className="details-section-content" style={{ marginTop: '10px' }}>
                <p className="details-section-text" style={{ margin: 0 }}>{product.material}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRODUCT SHOWCASE SECTION */}
      {product.showcaseImages && (
        <div className="v2-product-showcase">
          <div className="showcase-grid">
            {product.showcaseImages.map((img, idx) => (
              <div key={idx} className="showcase-item">
                <div className="square-frame">
                  {/* Rendering SHOWCASE/DESCRIPTION IMAGES */}
                  <img src={img} alt={`${product.name} showcase ${idx}`} loading="lazy" decoding="async" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YOU MAY ALSO LIKE SECTION */}
      <section className="v2-related-products">
        <div className="section-header">
          <h2 className="section-title scroll-reveal-title" ref={titleRef}>You may also like</h2>
        </div>

        {/* Desktop grid (only 4 items max) */}
        <div className="related-grid related-desktop">
          {relatedProducts.slice(0, 4).map(rp => (
            <Link key={rp.id} to={`/product/${rp.id}`} className="v2-product-card-link">
              <div className="v2-product-card">
                <div className="card-img-wrap">
                  {/* Rendering RELATED PRODUCT IMAGES */}
                  <img src={rp.image} alt={rp.name} loading="lazy" decoding="async" />
                </div>
                <div className="card-info">
                  <h4 className="card-title">{rp.name}</h4>
                  <div className="card-pricing">
                    <span className="price-now">₹{rp.price}</span>
                    <span className="price-was">₹{rp.oldPrice}</span>
                  </div>
                  <p className="card-discount">{Math.round((1 - rp.price / rp.oldPrice) * 100)}% OFF</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile multi-row swipers */}
        <div className="related-mobile-multi-rows">
          {relatedChunks.map((chunk, rowIdx) => (
            <MobileRelatedRow key={`related-row-${rowIdx}`} products={chunk} />
          ))}
        </div>
      </section>

      {/* RECENTLY VIEWED SECTION */}
      <section className="v2-recently-viewed" style={{ padding: '0 0 60px', background: '#fff', width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="section-header" style={{ width: '100%', padding: '0 20px', marginBottom: '20px' }}>
          <h2 className="section-title">Recently Viewed</h2>
        </div>
        {recentlyViewedProducts.length > 0 ? (
          <div className="related-grid" style={{ width: '100%' }}>
            {recentlyViewedProducts.map((rp, index) => (
              <Link key={rp.id} to={`/product/${rp.id}`} className={`v2-product-card-link ${index >= 2 ? 'hide-on-mobile' : ''}`}>
                <div className="v2-product-card">
                  <div className="card-img-wrap">
                    <img src={rp.image} alt={rp.name} loading="lazy" decoding="async" />
                  </div>
                  <div className="card-info">
                    <h4 className="card-title">{rp.name}</h4>
                    <div className="card-pricing">
                      <span className="price-now">₹{rp.price}</span>
                      <span className="price-was">₹{rp.oldPrice}</span>
                    </div>
                    <p className="card-discount">{Math.round((1 - rp.price / rp.oldPrice) * 100)}% OFF</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-mid)', textAlign: 'center', width: '100%' }}>You haven't viewed any other products yet.</p>
        )}
      </section>

      {/* REVIEWS SECTION */}
      {(() => {
        const reviewsList = localReviews || [];
        const totalReviews = reviewsList.length;
        const averageRating = totalReviews > 0
          ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
          : '0.0';
        
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsList.forEach(r => {
          if (starCounts[r.rating] !== undefined) {
            starCounts[r.rating]++;
          }
        });
        
        const getStarPercentage = (star) => {
          if (totalReviews === 0) return 0;
          return Math.round((starCounts[star] / totalReviews) * 100);
        };

        const allCustomerImages = reviewsList.reduce((images, r) => {
          if (r.images && Array.isArray(r.images)) {
            return [...images, ...r.images];
          }
          return images;
        }, []);

        return (
          <section className="v2-reviews-section" style={{ width: '98%', maxWidth: '98%', margin: '0 auto', padding: '60px 20px', background: '#fff', boxSizing: 'border-box' }}>
            
            {/* Green Success Ribbon */}
            {reviewSuccess && (
              <div className="review-success-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f4fbf7', border: '1.5px solid #22c55e', borderRadius: '8px', padding: '16px 20px', marginBottom: '35px', color: '#15803d' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <svg className="ribbon-success-icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" width="22" height="22" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <h4 style={{ margin: '0 0 5px', fontSize: '1.05rem', fontWeight: '800', fontFamily: 'Plus Jakarta Sans' }}>Review submitted successfully!</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534', lineHeight: '1.4', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Your review has been posted. Thank you for sharing your feedback with the community.</p>
                  </div>
                </div>
                <button onClick={() => setReviewSuccess(false)} style={{ background: 'none', border: 'none', fontSize: '16px', color: '#166534', cursor: 'pointer', padding: 0, fontWeight: '700' }}>✕</button>
              </div>
            )}

            <div className="reviews-top-grid">
              
              {/* Left Column: Summary Stats & Write Review Trigger */}
              <div className="reviews-stats-col">
                <h3 className="amazon-section-header" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)', margin: '0 0 15px', fontFamily: 'Plus Jakarta Sans' }}>Customer reviews</h3>
                
                <div className="average-rating-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => {
                      const isFilled = s <= Math.round(Number(averageRating));
                      return (
                        <svg key={s} viewBox="0 0 24 24" fill={isFilled ? "#ff9900" : "#e0e0e0"} width="20" height="20">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      );
                    })}
                  </div>
                  <span className="avg-rating-num-txt" style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)' }}>{averageRating} out of 5</span>
                </div>
                
                <div className="total-ratings-count" style={{ fontSize: '0.85rem', color: 'var(--text-mid)', fontWeight: '600', margin: '5px 0 20px' }}>
                  {totalReviews} global rating{totalReviews !== 1 ? 's' : ''}
                </div>
                
                <div className="stars-progress-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '35px' }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = getStarPercentage(star);
                    return (
                      <div key={star} className="star-row-progress" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="star-row-label" style={{ minWidth: '40px', fontSize: '0.85rem', color: '#0066c0', fontWeight: '700', cursor: 'pointer' }}>{star} star</span>
                        <div className="progress-bar-bg" style={{ flex: 1, height: '18px', background: '#f0f2f2', border: '1px solid #d5d9d9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="progress-bar-fill" style={{ width: `${pct}%`, height: '100%', background: '#ff9900', borderRadius: '3px' }}></div>
                        </div>
                        <span className="star-row-pct" style={{ minWidth: '35px', textAlign: 'right', fontSize: '0.85rem', color: '#0066c0', fontWeight: '700' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                {/* Write Review Prompt */}
                <div className="review-this-product-card" style={{ borderTop: '1px solid var(--border)', paddingTop: '25px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)', margin: '0 0 5px' }}>Review this product</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-mid)', margin: '0 0 15px', lineHeight: '1.4' }}>Share your thoughts with other customers</p>
                  
                  <button 
                    type="button"
                    className="write-review-trigger-btn"
                    onClick={() => {
                      if (!currentUser) {
                        setShowLoginModal(true);
                      } else {
                        setShowWriteReviewForm(!showWriteReviewForm);
                        setTimeout(() => {
                          const formEl = document.querySelector('.write-review-form-container');
                          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      background: '#fff', 
                      border: '1px solid #d5d9d9', 
                      borderRadius: '8px', 
                      padding: '10px 16px', 
                      fontSize: '0.85rem', 
                      fontWeight: '600', 
                      color: '#0f1111', 
                      cursor: 'pointer', 
                      display: 'block', 
                      textAlign: 'center', 
                      boxSizing: 'border-box',
                      boxShadow: '0 2px 5px rgba(213,217,217,.2)'
                    }}
                  >
                    Write a product review
                  </button>
                </div>
              </div>
              
              {/* Right Column: customer photos, write review form, review lists */}
              <div className="reviews-main-col" style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                
                {/* Customer Photos Gallery (Now shown at the top of the column) */}
                {allCustomerImages.length > 0 && (
                  <div className="customer-images-gallery-section" style={{ borderTop: 'none', marginTop: '0', paddingTop: '0', marginBottom: '35px', position: 'relative' }}>
                    <div className="customer-images-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)', margin: 0 }}>Customer photos and videos</h4>
                    </div>
                    
                    {/* Horizontal scroll track with left and right chevron buttons */}
                    <div className="customer-scroll-wrapper" style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '8px' }}>
                      {/* Left Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollCustomerImages('left')}
                        style={{
                          position: 'absolute',
                          left: '4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '32px',
                          height: '42px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #d5d9d9',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: '#111',
                          fontWeight: 'bold',
                          outline: 'none'
                        }}
                      >
                        ‹
                      </button>

                      {/* Scroll container */}
                      <div 
                        ref={customerImagesGridRef}
                        className="customer-images-grid" 
                        style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {allCustomerImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="customer-image-thumb" 
                            onClick={() => {
                              setLightboxImagesList(allCustomerImages);
                              setActiveLightboxImageIdx(idx);
                            }}
                            style={{ width: '80px', height: '80px', minWidth: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
                          >
                            <img src={img} alt={`customer-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>

                      {/* Right Arrow Button */}
                      <button
                        type="button"
                        onClick={() => scrollCustomerImages('right')}
                        style={{
                          position: 'absolute',
                          right: '4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '32px',
                          height: '42px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #d5d9d9',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          color: '#111',
                          fontWeight: 'bold',
                          outline: 'none'
                        }}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}

                {/* Write Review Form Card (Shown if active) */}
                {showWriteReviewForm && currentUser && (
                  <div className="write-review-form-container" style={{ border: '1.5px solid var(--secondary)', borderRadius: '12px', padding: '30px', marginBottom: '35px', background: '#fff' }}>
                    <form className="write-review-form" onSubmit={handleReviewSubmit}>
                      <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', margin: '0 0 20px' }}>Create Review</h4>
                      
                      <div className="form-group">
                        <label>Overall Rating *</label>
                        <div className="interactive-stars-row">
                          {[1, 2, 3, 4, 5].map((s) => {
                            const isSelected = s <= reviewRating;
                            return (
                              <button 
                                key={s} 
                                type="button" 
                                onClick={() => setReviewRating(s)}
                                className="interactive-star-btn"
                              >
                                <svg viewBox="0 0 24 24" fill={isSelected ? "#ff9900" : "#e0e0e0"} width="32" height="32" className="interactive-star">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Add a headline</label>
                        <input 
                          type="text" 
                          placeholder="What's most important to know?"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="review-input"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Add a written review *</label>
                        <textarea 
                          rows="4"
                          placeholder="What did you like or dislike? What did you use this product for?"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                          className="review-textarea"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Add photos (Images only)</label>
                        <div className="add-photo-container">
                          <label className="add-photo-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-mid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                              <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                            <span className="add-photo-label">Add Photo</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={handleReviewImagesChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                          
                          {reviewImagePreviews.map((preview, index) => (
                            <div key={index} className="review-preview-thumb">
                              <img src={preview} alt={`preview-${index}`} />
                              <button 
                                type="button" 
                                onClick={() => handleRemoveReviewImage(index)}
                                className="remove-preview-btn"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {reviewError && (
                        <div className="review-error-message" style={{ marginBottom: '15px' }}>
                          {reviewError}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                        <button 
                          type="submit" 
                          className="v2-btn" 
                          disabled={isSubmittingReview}
                          style={{ flex: 2, padding: '14px', borderRadius: '50px', background: 'var(--secondary)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                        >
                          {isSubmittingReview ? 'Uploading & Posting...' : 'Submit Review'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowWriteReviewForm(false)}
                          style={{ flex: 1, padding: '14px', borderRadius: '50px', border: '1.5px solid var(--border)', background: 'none', color: 'var(--text-mid)', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Public Reviews List */}
                <div className="public-reviews-list-section" style={{ borderTop: '1px solid var(--border)', paddingTop: '35px' }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '30px' }}>Top reviews</h4>
                  
                  {reviewsList.length === 0 ? (
                    <p className="no-reviews-text">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    <div className="reviews-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      {reviewsList.map((rev) => {
                        const isOwner = currentUser && (
                          currentUser._id === rev.userId || 
                          currentUser.id === rev.userId || 
                          String(currentUser._id) === String(rev.userId)
                        );
                        
                        return (
                          <div key={rev._id || rev.createdAt} className="v2-review-card-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '18px', borderBottom: '1px solid var(--border)', background: 'transparent', boxShadow: 'none', border: 'none', borderBottom: '1px solid #eee', width: '100%', opacity: 1 }}>
                            {/* Reviewer Profile */}
                            <div className="reviewer-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                              <div className="reviewer-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2.5" width="16" height="16">
                                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                              </div>
                              <span className="reviewer-name" style={{ fontSize: '0.9rem', fontWeight: '500', color: '#111' }}>
                                {rev.userName || 'Anonymous'}
                              </span>

                              {/* 3-dots actions menu dropdown */}
                              <div 
                                className="review-actions-menu-container" 
                                style={{ 
                                  position: 'relative', 
                                  marginLeft: 'auto',
                                  opacity: openMenuReviewId === rev._id ? 1 : undefined,
                                  pointerEvents: openMenuReviewId === rev._id ? 'auto' : undefined
                                }}
                              >
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuReviewId(openMenuReviewId === rev._id ? null : rev._id);
                                  }}
                                  style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#555', 
                                    fontSize: '22px', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer', 
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1
                                  }}
                                >
                                  ⋮
                                </button>
                                
                                {openMenuReviewId === rev._id && (
                                  <div className="review-dropdown-actions" style={{ position: 'absolute', right: 0, top: '28px', background: '#fff', border: '1px solid #d5d9d9', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '130px', padding: '5px 0' }}>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        alert('Review reported. Thank you for making FitBox Sports a safe marketplace.');
                                        setOpenMenuReviewId(null);
                                      }}
                                      style={{ display: 'block', width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: '#111', fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}
                                    >
                                      Report
                                    </button>
                                    {isOwner && (
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteReview(rev._id);
                                          setOpenMenuReviewId(null);
                                        }}
                                        style={{ display: 'block', width: '100%', padding: '10px 15px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: '#c45500', fontFamily: 'Plus Jakarta Sans', fontWeight: '700', borderTop: '1px solid #f0f0f0' }}
                                      >
                                        Delete Review
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Stars rating & Title */}
                            <div className="review-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <div className="review-stars" style={{ display: 'flex', gap: '1px' }}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <svg key={s} viewBox="0 0 24 24" fill={s <= rev.rating ? "#ff9900" : "#e0e0e0"} width="15" height="15">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                ))}
                              </div>
                              {rev.title && (
                                <span className="review-card-title" style={{ fontWeight: '700', fontSize: '0.95rem', color: '#111' }}>{rev.title}</span>
                              )}
                            </div>

                            {/* Location & Date */}
                            <div className="review-card-date" style={{ color: 'var(--text-mid)', fontSize: '0.82rem', fontWeight: '500' }}>
                              Reviewed in India on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>

                            {/* Comment */}
                            <p className="review-card-comment" style={{ color: '#111', fontSize: '0.95rem', lineHeight: '1.6', margin: '3px 0' }}>{rev.comment}</p>
                            
                            {/* Images */}
                            {rev.images && rev.images.length > 0 && (
                              <div className="review-card-images" style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                {rev.images.map((img, i) => (
                                  <div 
                                    key={i} 
                                    className="review-image-wrap" 
                                    onClick={() => {
                                      setLightboxImagesList(rev.images);
                                      setActiveLightboxImageIdx(i);
                                    }}
                                    style={{ width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
                                  >
                                    <img src={img} alt={`review-img-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Action links row */}
                            <div className="review-action-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <button 
                                type="button"
                                onClick={(e) => handleHelpfulClick(e, rev._id)}
                                style={{ 
                                  background: 'none', 
                                  border: 'none', 
                                  cursor: 'pointer', 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 4px',
                                  outline: 'none',
                                  transition: 'transform 0.1s ease'
                                }}
                              >
                                {currentUser && rev.helpful?.includes(currentUser._id || currentUser.id || String(currentUser._id)) ? (
                                  <svg viewBox="0 0 24 24" fill="#e02424" stroke="#e02424" strokeWidth="2.5" width="16" height="16" style={{ pointerEvents: 'none' }}>
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="#a8a8a8" strokeWidth="2.5" width="16" height="16" style={{ pointerEvents: 'none' }}>
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                  </svg>
                                )}
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#555' }}>
                                  {rev.helpful ? rev.helpful.length : 0}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Swipeable Cyclic Lightbox Modal */}
      {lightboxImagesList.length > 0 && (
        <div 
          className="review-lightbox-overlay" 
          onClick={() => setLightboxImagesList([])}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
          style={{ background: '#000000', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}
        >
          <div className="review-lightbox-modal" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Close button */}
            <button 
              className="review-lightbox-close" 
              onClick={() => setLightboxImagesList([])}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(50, 50, 50, 0.75)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', zIndex: 100001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>

            {/* Left Chevron (Rectangular Arrow) */}
            {lightboxImagesList.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); prevLightboxImage(); }}
                style={{ 
                  position: 'absolute', 
                  left: '15px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'rgba(50, 50, 50, 0.75)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  color: '#fff', 
                  width: '40px', 
                  height: '60px', 
                  borderRadius: '4px', 
                  fontSize: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  zIndex: 100000,
                  outline: 'none'
                }}
              >
                ‹
              </button>
            )}

            {/* Main Image */}
            <img 
              src={lightboxImagesList[activeLightboxImageIdx]} 
              alt="Fullscreen lightbox preview" 
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', userSelect: 'none' }} 
            />

            {/* Right Chevron (Rectangular Arrow) */}
            {lightboxImagesList.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); nextLightboxImage(); }}
                style={{ 
                  position: 'absolute', 
                  right: '15px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'rgba(50, 50, 50, 0.75)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  color: '#fff', 
                  width: '40px', 
                  height: '60px', 
                  borderRadius: '4px', 
                  fontSize: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  zIndex: 100000,
                  outline: 'none'
                }}
              >
                ›
              </button>
            )}

          </div>
        </div>
      )}

      <Footer />
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
        orderId={currentOrderId}
        checkoutItems={checkoutItems}
        checkoutTotal={checkoutTotal}
        deliveryFee={buyNowDeliveryFee}
        onSuccess={(id) => {
          setIsCheckoutModalOpen(false);
          navigate('/orders');
        }}
      />

      {isFullscreen && (
        <div className="fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
          <div className="fullscreen-modal" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-close" onClick={() => setIsFullscreen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="fullscreen-left">
              <img src={images[currentImgIdx]} alt={product.name} loading="lazy" decoding="async" />
            </div>
            <div className="fullscreen-right">
              <h2>{product.name}</h2>
              {currentVariant && currentVariant.color && (
                <div className="fullscreen-variant-info">
                  Color: <span>{currentVariant.color}</span>
                </div>
              )}
              <div className="fullscreen-thumbnails">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`fullscreen-thumb ${currentImgIdx === idx ? 'active' : ''}`}
                    onClick={() => setCurrentImgIdx(idx)}
                  >
                    <img src={img} alt="thumbnail" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
