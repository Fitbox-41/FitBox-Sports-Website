import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Privacy() {
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
            <h1 className="info-title">Privacy Policy</h1>
            <span className="info-date">Last Updated: May 2026</span>
          </div>

          <div className="info-content">
            <p>At <strong>FitBox Sports</strong>, we are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data.</p>

            <h2>1. Information We Collect</h2>
            <p>We may collect the following types of information when you use our website:</p>
            <ul>
              <li><strong>Personal Identification Information:</strong> Name, email address, shipping address, and phone number when you create an account or place an order.</li>
              <li><strong>Authentication Data:</strong> Information securely provided by Google (like your email) if you choose to "Continue with Google".</li>
              <li><strong>Payment Information:</strong> Credit card details and billing addresses are processed securely by our payment gateways. We do not store your full credit card number.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul>
              <li>Process and fulfill your orders, including sending emails to confirm your order status and shipment.</li>
              <li>Communicate with you regarding customer support inquiries.</li>
              <li>Improve our website, product offerings, and customer service.</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates.</p>

            <h2>4. Security</h2>
            <p>We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information, username, password, transaction information, and data stored on our Site.</p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:</p>
            <p><strong>Email:</strong> fitboxsports01@gmail.com</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
