import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Shipping() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Shipping Information</h1>
        <p className="info-hero-subtitle">Everything you need to know about delivery times, costs, and tracking your fitness gear.</p>
      </section>

      <div className="info-container">
        <div className="info-card">
          <div className="info-section-head">
            <h2 className="info-title">Shipping Policy</h2>
            <span className="info-date">Last Updated: May 2026</span>
          </div>

          <div className="info-body">
            <p>At <strong>FitBox Sports</strong>, we strive to deliver your premium fitness equipment as quickly and safely as possible.</p>

            <div className="shipping-badges">
              <div className="shipping-badge">
                <div className="shipping-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                <div>
                  <div className="shipping-badge-label">Processing Time</div>
                  <div className="shipping-badge-value">1 - 2 Business Days</div>
                </div>
              </div>
              <div className="shipping-badge">
                <div className="shipping-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                <div>
                  <div className="shipping-badge-label">Standard Delivery</div>
                  <div className="shipping-badge-value">3 - 5 Business Days</div>
                </div>
              </div>
            </div>

            <div className="info-notice warning">
              <p><strong>No International Shipping:</strong> We currently only ship to addresses within India. We do not offer international shipping or shipping to forwarding services at this time.</p>
            </div>

            <h2>1. Processing and Delivery Times</h2>
            <p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
            <ul>
              <li><strong>Standard Shipping:</strong> 3-5 business days delivery time.</li>
              <li><strong>Express Shipping:</strong> 1-2 business days delivery time (if selected at checkout).</li>
            </ul>
            <p><em>Please note that potential delays due to a high volume of orders or postal service problems are outside of our control.</em></p>

            <h2>2. Shipping Rates</h2>
            <p>Shipping charges for your order will be calculated and displayed at checkout. We often run promotions for free shipping on orders over a certain amount (e.g., Free Shipping on orders over ₹999).</p>

            <h2>3. Order Tracking</h2>
            <p>When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
            
            <h2>4. Delivery Issues</h2>
            <p>If you haven't received your order within the estimated delivery time, please check your tracking link. If the issue persists, please <a href="/contact">contact our support team</a> with your order number.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
