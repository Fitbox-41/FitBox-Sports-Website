import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Package, ClipboardList, Truck, MapPin, CheckCircle, Download } from 'lucide-react';
import './TrackOrder.css';

const TrackOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const [activeStep, setActiveStep] = useState(-1);
  const [targetStep, setTargetStep] = useState(-1);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!order) {
      // Fallback if accessed directly without state
      navigate('/orders');
      return;
    }

    // Map order status to progress steps
    let stepIndex = 0; // 0 = Ordered
    
    // Simple mapping logic based on standard statuses
    if (order.shipmentStatus === 'Ready to Ship') {
      stepIndex = 1;
    }
    if (order.shipmentStatus === 'In Transit') {
      stepIndex = 2;
    } 
    if (order.shipmentStatus === 'Out for Delivery') {
      stepIndex = 3;
    }
    if (order.orderStatus === 'Delivered' || order.shipmentStatus === 'Delivered') {
      stepIndex = 4;
    }
    // Quick hack for 'Ready to Ship' if processing
    if (stepIndex === 0 && order.orderStatus === 'Processing') {
      stepIndex = 1;
    }

    // Set the target step, animation handles the rest
    setTargetStep(stepIndex);
  }, [order, navigate]);

  // Handle sequential animation
  useEffect(() => {
    if (targetStep > -1 && activeStep < targetStep) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 600); // 600ms per step
      return () => clearTimeout(timer);
    }
  }, [activeStep, targetStep]);

  if (!order) return null;

  const steps = [
    { label: 'Ordered', icon: <Package size={28} /> },
    { label: 'Ready To Ship', icon: <ClipboardList size={28} /> },
    { label: 'In Transit', icon: <Truck size={28} /> },
    { label: 'Out For Delivery', icon: <MapPin size={28} /> },
    { label: 'Delivered', icon: <CheckCircle size={28} /> },
  ];

  // Calculate the active line width for PC
  const lineWidth = activeStep < 0 ? '0%' : `${(activeStep / (steps.length - 1)) * 100}%`;

  const getSubtotal = () => {
    return order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return order.taxAmount || 0; 
  };

  const getDiscount = () => {
    return order.discountAmount || 0;
  };

  return (
    <div className="track-order-page">
      <Header />
      
      <div className="track-order-container">
        
        {/* Top Card: Progress Tracker */}
        <div className="track-order-card">
          <div className="track-order-header">
            <h2>#{order.orderId || order._id}</h2>
            <div className="track-order-destination">
              {order.shippingAddress?.city || 'Destination'}
            </div>
          </div>
          
          <div className="progress-container">
            <div className="progress-line" style={{ width: lineWidth }}></div>
            {steps.map((step, idx) => (
              <div key={idx} className={`progress-step ${idx <= activeStep ? 'active' : ''}`}>
                <div className="progress-icon-wrap">
                  {step.icon}
                </div>
                <div className="progress-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div className="track-order-grid">
          
          {/* Customer Information */}
          <div className="detail-card">
            <h3>Customer Information</h3>
            <div className="detail-row">
              <div className="detail-label">Order no :</div>
              <div className="detail-value">#{order.orderId || order._id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Customer name :</div>
              <div className="detail-value">{order.user?.name || order.shippingAddress?.fullName || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Shipping address :</div>
              <div className="detail-value">
                {order.shippingAddress?.addressLine1}, 
                {order.shippingAddress?.city}, 
                {order.shippingAddress?.state}, 
                {order.shippingAddress?.postalCode}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone no :</div>
              <div className="detail-value">{order.shippingAddress?.phone || order.user?.phone || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email :</div>
              <div className="detail-value">{order.user?.email || 'N/A'}</div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="detail-card">
            <h3>Tracking Information</h3>
            <div className="detail-row">
              <div className="detail-label">AWB :</div>
              <div className="detail-value">{order.awb || order.trackingId || 'Pending'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Courier name :</div>
              <div className="detail-value">{order.courier || 'Standard Shipping'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Origin :</div>
              <div className="detail-value">Warehouse</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Destination :</div>
              <div className="detail-value">{order.shippingAddress?.city || 'N/A'}</div>
            </div>
          </div>

          {/* Download Invoice (replacing Shipment History) */}
          <div className="detail-card">
            <h3>Invoice</h3>
            {order.invoiceUrl ? (
              <div>
                <p style={{ color: '#475569', marginBottom: '20px', fontSize: '14px' }}>
                  Your invoice has been generated and is ready to download.
                </p>
                <a 
                  href={order.invoiceUrl.startsWith('http') ? order.invoiceUrl : `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}${order.invoiceUrl}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="download-invoice-btn"
                >
                  <Download size={18} /> Download Invoice
                </a>
              </div>
            ) : (
              <p className="no-data">Invoice will be available after the order is processed.</p>
            )}
          </div>

          {/* Items of shipment */}
          <div className="detail-card">
            <h3>Items of shipment</h3>
            <div style={{ marginBottom: '20px' }}>
              {order.items?.map((item, idx) => {
                let img = item.image || item.imgSrc;
                if (img && typeof img === 'string') {
                  img = img.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                }
                const itemId = item.productId || item.id || item._id;

                return (
                  <div key={idx} className="shipment-item">
                    <Link to={`/product/${itemId}`}>
                      <img 
                        src={img || '/placeholder.png'} 
                        alt={item.name} 
                        className="shipment-item-img" 
                      />
                    </Link>
                    <div className="shipment-item-details">
                      <Link to={`/product/${itemId}`} style={{ textDecoration: 'none' }}>
                        <h4 className="shipment-item-name">{item.name}</h4>
                      </Link>
                      {item.variant && <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 5px' }}>Variant: {item.variant}</p>}
                      <p className="shipment-item-price">Price : ₹{item.price?.toFixed(2)}</p>
                      <p className="shipment-item-qty">Qty : {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="totals-section">
              <div className="totals-row">
                <span>Subtotal :</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Tax :</span>
                <span>₹{getTax().toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Shipping Charge :</span>
                <span>₹{(order.shippingCharge || 0).toFixed(2)}</span>
              </div>
              {getDiscount() > 0 && (
                <div className="totals-row">
                  <span>Discount :</span>
                  <span>-₹{getDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="totals-row grand-total">
                <span>Total :</span>
                <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TrackOrder;
