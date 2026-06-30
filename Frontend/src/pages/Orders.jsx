import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Orders.css';

export default function Orders() {
  const { currentUser } = useAuth();
  const { toggleWishlist, wishlist } = useCart();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentToast, setPaymentToast] = useState(null); // { type: 'success'|'failed'|'pending'|'error', message }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentToast({ type: 'success', message: 'Payment successful! Your order has been confirmed.' });
    } else if (payment === 'failed') {
      setPaymentToast({ type: 'error', message: 'Payment failed. Your order could not be processed. Please try again.' });
    } else if (payment === 'pending') {
      setPaymentToast({ type: 'pending', message: 'Payment is pending. Your order will be updated once payment is confirmed.' });
    } else if (payment === 'error') {
      const reason = params.get('reason') || 'unknown';
      setPaymentToast({ type: 'error', message: `Something went wrong during payment (Reason: ${reason}). Please check your order status.` });
    }
    if (payment) {
      const timer = setTimeout(() => setPaymentToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  useEffect(() => {
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
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
       fetchOrders();
    } else {
       setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
     return <div className="orders-page"><Header /><div style={{ height: '110px' }} /><div style={{textAlign: 'center', padding: '50px'}}>Loading Orders...</div><Footer /></div>;
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('fitbox_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const apiUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      const res = await axios.delete(`${apiUrl}/api/orders/${orderId}/cancel`, config);
      if (res.data.success) {
        alert("Order cancelled successfully");
        // refresh orders
        const getRes = await axios.get(`${apiUrl}/api/orders/myorders`, config);
        if (getRes.data.success) {
          const sortedOrders = getRes.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sortedOrders);
        }
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
          background: paymentToast.type === 'success' ? '#dcfce7' : paymentToast.type === 'pending' ? '#fef3c7' : '#fee2e2',
          color: paymentToast.type === 'success' ? '#15803d' : paymentToast.type === 'pending' ? '#92400e' : '#b91c1c',
          border: `1px solid ${paymentToast.type === 'success' ? '#bbf7d0' : paymentToast.type === 'pending' ? '#fde68a' : '#fecaca'}`,
          animation: 'fadeIn 0.3s ease'
        }}>
          {paymentToast.message}
        </div>
      )}

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
                     <span style={{ display: 'inline-block', padding: '4px 12px', background: order.orderStatus === 'Cancelled' ? '#fecaca' : '#dcfce7', color: order.orderStatus === 'Cancelled' ? '#b91c1c' : '#166534', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                       {order.orderStatus === 'Cancelled' ? 'Cancelled' : order.paymentStatus}
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
                       <button
                         onClick={() => handleCancelOrder(order._id)}
                         style={{ display: 'block', marginTop: '10px', padding: '6px 12px', fontSize: '13px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', width: '100%' }}
                       >
                         Cancel Order
                       </button>
                     )}
                  </div>
                </div>

                {order.items.map((item, idx) => {
                  const img = item.image || item.imgSrc;
                  const inWishlist = wishlist.some(w => w.id === item.productId);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 0', borderBottom: idx !== order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <Link to={`/product/${item.productId}`} style={{ flexShrink: 0 }}>
                        <img src={img} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
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

