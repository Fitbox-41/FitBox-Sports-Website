import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Orders.css';

const CANCEL_REASONS = [
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Changed my mind",
  "Delivery time too long",
  "Item no longer needed",
  "Shipping cost too high",
  "Other"
];

const CancellationModal = ({ isOpen, onClose, onSubmit, isProcessingRefund }) => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  
  if (!isOpen) return null;

  const toggleReason = (reason) => {
    setSelectedReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
        <h3 style={{ marginTop: 0, fontSize: '18px', color: '#0f172a' }}>Cancel Order</h3>
        {isProcessingRefund ? (
          <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600', marginBottom: '16px' }}>
            Your refund is processing. Kindly tell us the reason for order cancellation.
          </p>
        ) : (
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
            Kindly tell us the reason for order cancellation.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {CANCEL_REASONS.map(reason => (
            <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedReasons.includes(reason)}
                onChange={() => toggleReason(reason)}
                style={{ width: '16px', height: '16px', accentColor: '#ff6b35' }}
              />
              {reason}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
          >
            Go Back
          </button>
          <button 
            onClick={() => {
              onSubmit(selectedReasons);
              setSelectedReasons([]);
            }}
            disabled={selectedReasons.length === 0}
            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: selectedReasons.length === 0 ? '#94a3b8' : '#ef4444', color: '#fff', cursor: selectedReasons.length === 0 ? 'not-allowed' : 'pointer', fontWeight: '500' }}
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

const CancelButtonWithTimer = ({ order, onCancelClick }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const orderTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const diff = (orderTime + 60 * 60 * 1000) - now;
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      const orderTime = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diff = (orderTime + 60 * 60 * 1000) - now;
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [order.createdAt, timeLeft]);

  if (timeLeft <= 0) {
    return <div style={{ height: '34px', marginTop: '10px' }} />; // Empty space
  }

  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div>
      <button
        onClick={() => onCancelClick(order)}
        style={{ display: 'block', marginTop: '10px', padding: '6px 12px', fontSize: '13px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: '500' }}
      >
        Cancel Order
      </button>
      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', textAlign: 'center', fontWeight: '500' }}>
        Can cancel for: <span style={{ color: '#ef4444' }}>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default function Orders() {
  const { currentUser } = useAuth();
  const { toggleWishlist, wishlist, clearCart } = useCart();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentToast, setPaymentToast] = useState(null); // { type: 'success'|'failed'|'error', message }
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  const getPaymentLabel = (order) => {
    if (order.isRefunded) return 'Order Refunded';
    if (order.orderStatus === 'Cancelled') return 'Cancelled';
    if (order.paymentMode === 'COD') return order.paymentStatus === 'Paid' ? 'Paid (COD)' : 'COD - Pay on Delivery';
    if (order.paymentStatus === 'Paid') return 'Paid';
    if (order.paymentStatus === 'Failed') return 'Payment Failed';
    return 'Payment Incomplete';
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.get(`${apiUrl}/api/orders/myorders`, config);
      if (res.data.success) {
        const sortedOrders = res.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const reconcilePayment = async () => {
      const params = new URLSearchParams(location.search);
      const payment = params.get('payment');
      const orderId = params.get('orderId');

      if (payment === 'success') {
        setPaymentToast({ type: 'success', message: 'Payment successful! Your order has been confirmed.' });
        clearCart();
      } else if (payment === 'failed') {
        setPaymentToast({ type: 'error', message: 'Payment was not completed. Please try again from your cart.' });
      } else if (payment === 'error') {
        const reason = params.get('reason') || 'unknown';
        setPaymentToast({ type: 'error', message: `Something went wrong during payment (Reason: ${reason}). Please check your order status.` });
      }

      if (orderId && currentUser && ['success', 'failed', 'pending', 'error'].includes(payment)) {
        try {
          const token = localStorage.getItem('fitbox_token');
          const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
          const verifyRes = await axios.post(
            `${apiUrl}/api/orders/${orderId}/verify-payment`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (verifyRes.data.success) {
            const status = verifyRes.data.paymentStatus;
            if (status === 'Paid') {
              setPaymentToast({ type: 'success', message: 'Payment successful! Your order has been confirmed.' });
              clearCart();
            } else if (status === 'Failed') {
              setPaymentToast({ type: 'error', message: 'Payment was not completed. Please try again from your cart.' });
            }
          }
        } catch (err) {
          console.error('Payment verification failed', err);
        }
      }

      if (payment) {
        const timer = setTimeout(() => setPaymentToast(null), 6000);
        return () => clearTimeout(timer);
      }
    };

    reconcilePayment();
  }, [location.search, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [currentUser, location.search]);

  useEffect(() => {
    const reconcileStuckOrders = async () => {
      const stuckOnlineOrders = orders.filter(
        (order) => order.paymentMode !== 'COD' && order.paymentStatus === 'Pending Payment' && order.paymentId
      );
      if (stuckOnlineOrders.length === 0) return;

      try {
        const token = localStorage.getItem('fitbox_token');
        const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
        await Promise.all(
          stuckOnlineOrders.map((order) =>
            axios.post(
              `${apiUrl}/api/orders/${order._id}/verify-payment`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
        await fetchOrders();
      } catch (err) {
        console.error('Failed to reconcile stuck online orders', err);
      }
    };

    if (!loading && currentUser) {
      reconcileStuckOrders();
    }
  }, [loading, currentUser]);

  if (loading) {
     return <div className="orders-page"><Header /><div style={{ height: '110px' }} /><div style={{textAlign: 'center', padding: '50px'}}>Loading Orders...</div><Footer /></div>;
  }

  const handleCancelClick = (order) => {
    setCancelModalOrder(order);
  };

  const confirmCancellation = async (reasons) => {
    if (!cancelModalOrder) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      
      const payload = { cancelReason: reasons };
      const res = await axios.post(`${apiUrl}/api/orders/${cancelModalOrder._id}/cancel`, payload, config);
      
      if (res.data.success) {
        if (cancelModalOrder.paymentStatus === 'Paid') {
          alert('We are sorry to see your order cancelled. Your refund has been initiated and will reflect in your original payment method within 5-7 business days.');
        } else {
          alert('Order cancelled successfully');
        }
        setCancelModalOrder(null);
        await fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <Header />
      <div className="header-spacer" style={{ height: '110px' }} />

      {paymentToast && (
        <div style={{
          position: 'fixed',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '14px 28px',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          background: paymentToast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: paymentToast.type === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${paymentToast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          animation: 'fadeIn 0.3s ease'
        }}>
          {paymentToast.message}
        </div>
      )}

      <CancellationModal
        isOpen={!!cancelModalOrder}
        onClose={() => setCancelModalOrder(null)}
        onSubmit={confirmCancellation}
        isProcessingRefund={cancelModalOrder?.paymentStatus === 'Paid'}
      />

      <main className="orders-main container">
        <h1 className="orders-title">Your Orders</h1>

        {orders.length > 0 ? (
          <div className="orders-list-container">
            {orders.map((order, orderIdx) => (
              <div key={orderIdx} className="order-group" style={{ marginBottom: '40px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                  <div className="order-header-left">
                  <h2 className="order-id">
                    Order {order.invoiceNumber ? order.invoiceNumber : `FBX-${order._id.toString().slice(-8).toUpperCase()}`}
                  </h2>
                  <span className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                  <div style={{ textAlign: 'right' }}>
                     <span style={{ display: 'inline-block', padding: '4px 12px', background: order.isRefunded ? '#dcfce7' : order.orderStatus === 'Cancelled' || order.paymentStatus === 'Failed' ? '#fecaca' : order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7', color: order.isRefunded ? '#166534' : order.orderStatus === 'Cancelled' || order.paymentStatus === 'Failed' ? '#b91c1c' : order.paymentStatus === 'Paid' ? '#166534' : '#92400e', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                       {getPaymentLabel(order)}
                     </span>
                     {order.invoiceUrl && order.orderStatus !== 'Cancelled' && (
                       <a 
                         href={order.invoiceUrl.startsWith('http') ? order.invoiceUrl : `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}${order.invoiceUrl}`} 
                         target="_blank" 
                         rel="noreferrer" 
                         style={{ display: 'block', marginTop: '10px', fontSize: '14px', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
                       >
                         Download Invoice
                       </a>
                     )}
                     {order.trackingUrl && order.orderStatus !== 'Cancelled' && (
                       <a 
                         href={order.trackingUrl} 
                         target="_blank" 
                         rel="noreferrer" 
                         style={{ display: 'block', marginTop: '5px', fontSize: '14px', color: '#f97316', textDecoration: 'none', fontWeight: '500' }}
                       >
                         Track via {order.courier || 'Delhivery'}
                       </a>
                     )}
                     {order.orderStatus !== 'Cancelled' && order.shipmentStatus !== 'Shipped' && order.shipmentStatus !== 'Delivered' && (
                       <CancelButtonWithTimer 
                         order={order}
                         onCancelClick={handleCancelClick}
                       />
                     )}
                  </div>
                </div>

                {order.items.map((item, idx) => {
                  const img = item.image || item.imgSrc;
                  const inWishlist = wishlist.some(w => w.id === item.productId);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: idx !== order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <Link to={`/product/${item.productId}`} style={{ flexShrink: 0 }}>
                        <img src={img} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} / loading="lazy" decoding="async">
                      </Link>

                      <div style={{ flex: 1 }}>
                        <Link to={`/product/${item.productId}`} style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                          {item.name}
                        </Link>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          Qty: {item.quantity} {item.selectedVariant && `| Color: ${item.selectedVariant}`} {item.selectedSize && `| Size: ${item.selectedSize}`}
                        </div>
                      </div>
                      
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                        ₹{item.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-orders-state">
            <div className="empty-orders-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="80" height="80">
                <path d="M9 17H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-4" />
                <rect x="9" y="3" width="6" height="14" rx="1" />
              </svg>
            </div>
            <h2>You haven't placed any orders yet</h2>
            <p>Once you make a purchase, your past orders will appear here.</p>
            <Link to="/" className="continue-shopping-btn">Explore Products</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

