import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Package, ClipboardList, Truck, MapPin, CheckCircle, Download, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import './TrackOrder.css';

const TrackOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const [activeStep, setActiveStep] = useState(-1);
  const [targetStep, setTargetStep] = useState(-1);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);

  const fetchTracking = async () => {
    if (!order?._id) return;
    setTrackingLoading(true);
    setTrackingError(null);
    try {
      const token = localStorage.getItem('fitbox_token');
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await fetch(`${apiUrl}/api/orders/${order._id}/track`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.tracking) {
        setTrackingData(data.tracking);
        setLiveStatus(data.tracking.status);
      } else {
        setTrackingError('Could not fetch tracking data');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setTrackingError('Could not connect to tracking service');
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!order) {
      navigate('/orders');
      return;
    }
    fetchTracking();
  }, [order, navigate]);

  // Map status to progress steps
  useEffect(() => {
    const status = liveStatus || order?.shipmentStatus || order?.orderStatus;
    let stepIndex = 0;

    if (status === 'Created' || status === 'Ready to Ship') stepIndex = 1;
    if (status === 'In Transit') stepIndex = 2;
    if (status === 'Out for Delivery') stepIndex = 3;
    if (status === 'Delivered') stepIndex = 4;

    // Fallback for older data
    if (stepIndex === 0 && order?.orderStatus === 'Processing') stepIndex = 1;
    if (stepIndex === 0 && order?.orderStatus === 'Completed' && status !== 'Delivered') stepIndex = 1;

    setTargetStep(stepIndex);
  }, [liveStatus, order]);

  // Handle sequential animation
  useEffect(() => {
    if (targetStep > -1 && activeStep < targetStep) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 600);
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

  const isRTO = liveStatus === 'RTO';
  const isCancelled = liveStatus === 'Cancelled' || order.orderStatus === 'Cancelled';

  const formatScanDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="track-order-page">
      <Header />

      <div className="track-order-container">

        {/* Top Card: Progress Tracker */}
        <div className="track-order-card">
          <div className="track-order-header">
            <h2>#{order.orderId || order._id}</h2>
            <div className="track-order-header-right">
              {trackingData?.estimatedDate && (
                <div className="estimated-delivery">
                  <Clock size={14} />
                  <span>Est. Delivery: {formatScanDate(trackingData.estimatedDate)}</span>
                </div>
              )}
              <div className="track-order-destination">
                {order.shippingAddress?.city || 'Destination'}
              </div>
            </div>
          </div>

          {/* RTO / Cancelled banner */}
          {(isRTO || isCancelled) && (
            <div className={`status-banner ${isRTO ? 'rto' : 'cancelled'}`}>
              <AlertTriangle size={18} />
              <span>{isRTO ? 'This shipment is being returned to origin (RTO)' : 'This order has been cancelled'}</span>
            </div>
          )}

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

          {/* Live status indicator */}
          <div className="live-status-bar">
            <div className="live-status-left">
              {trackingData?.delhiveryStatus && (
                <span className="delhivery-status-badge">
                  {trackingData.delhiveryStatus}
                </span>
              )}
              {trackingData?.awb && (
                <span className="awb-badge">AWB: {trackingData.awb}</span>
              )}
            </div>
            <button
              className="refresh-tracking-btn"
              onClick={fetchTracking}
              disabled={trackingLoading}
              title="Refresh tracking"
            >
              <RefreshCw size={16} className={trackingLoading ? 'spin' : ''} />
              {trackingLoading ? 'Refreshing...' : 'Refresh'}
            </button>
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
              <div className="detail-value">{order.user?.name || order.shippingAddress?.fullName || order.shippingAddress?.name || order.customerName || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Shipping address :</div>
              <div className="detail-value">
                {order.shippingAddress?.street || order.shippingAddress?.addressLine1},
                {order.shippingAddress?.city},
                {order.shippingAddress?.state},
                {order.shippingAddress?.zip || order.shippingAddress?.postalCode}
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Phone no :</div>
              <div className="detail-value">{order.shippingAddress?.phone || order.user?.phone || order.customerPhone || 'N/A'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Email :</div>
              <div className="detail-value">{order.user?.email || order.customerEmail || 'N/A'}</div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="detail-card">
            <h3>Tracking Information</h3>
            <div className="detail-row">
              <div className="detail-label">AWB :</div>
              <div className="detail-value">{trackingData?.awb || order.awb || order.trackingId || 'Pending'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Courier name :</div>
              <div className="detail-value">{order.courier || 'Delhivery'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Status :</div>
              <div className="detail-value">
                <span className={`status-chip ${(liveStatus || order.shipmentStatus || '').toLowerCase().replace(/\s+/g, '-')}`}>
                  {liveStatus || order.shipmentStatus || 'Pending'}
                </span>
              </div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Origin :</div>
              <div className="detail-value">Jalandhar, Punjab</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Destination :</div>
              <div className="detail-value">{order.shippingAddress?.city || 'N/A'}</div>
            </div>
            {trackingData?.estimatedDate && (
              <div className="detail-row">
                <div className="detail-label">Est. Delivery :</div>
                <div className="detail-value">{formatScanDate(trackingData.estimatedDate)}</div>
              </div>
            )}
          </div>

          {/* Shipment History Timeline */}
          <div className="detail-card shipment-history-card">
            <h3>Shipment History</h3>
            {trackingLoading && !trackingData && (
              <div className="tracking-loading">
                <RefreshCw size={18} className="spin" />
                <span>Fetching live tracking...</span>
              </div>
            )}
            {trackingData?.scans && trackingData.scans.length > 0 ? (
              <div className="timeline">
                {trackingData.scans.map((scan, idx) => (
                  <div key={idx} className={`timeline-item ${idx === 0 ? 'latest' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-status">{scan.status}</div>
                      <div className="timeline-meta">
                        {scan.location && <span className="timeline-location">{scan.location}</span>}
                        {scan.timestamp && <span className="timeline-time">{formatScanDate(scan.timestamp)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !trackingLoading && (
                <div style={{ padding: '16px 0' }}>
                  {trackingError && !trackingData ? (
                    <p className="tracking-error-msg">
                      <AlertTriangle size={14} /> {trackingError}
                    </p>
                  ) : null}
                  <p className="no-data">
                    {!order.awb
                      ? 'Shipment has not been dispatched yet. Tracking updates will appear here once your order is shipped.'
                      : (trackingData?.error
                          ? 'Live tracking is temporarily unavailable. Your shipment is on its way — please check back later.'
                          : 'Tracking data will appear once the shipment is scanned by Delhivery.')}
                  </p>
                  {order.awb && (
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
                      Current status: <strong style={{ color: '#64748b' }}>{liveStatus || order.shipmentStatus || 'Processing'}</strong>
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          {/* Download Invoice */}
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
          <div className="detail-card items-card">
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
                <span>₹{(order.shippingCharge || order.deliveryCharge || 0).toFixed(2)}</span>
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
