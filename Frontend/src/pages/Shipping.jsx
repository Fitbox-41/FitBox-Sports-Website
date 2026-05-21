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

      <div className="info-container">
        <div className="info-card">
          <div className="info-header">
            <h1 className="info-title">Shipping & Returns</h1>
            <span className="info-date">Last Updated: May 2026</span>
          </div>

          <div className="info-content">
            <p>At <strong>FitBox Sports</strong>, we strive to deliver your premium fitness equipment as quickly and safely as possible.</p>

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

            <h2>4. Returns Policy</h2>
            <p>We accept returns up to 7 days after delivery, if the item is unused and in its original condition, and we will refund the full order amount minus the shipping costs for the return.</p>
            <p>In the event that your order arrives damaged in any way, please email us as soon as possible at <strong>fitboxsports01@gmail.com</strong> with your order number and a photo of the item's condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.</p>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
