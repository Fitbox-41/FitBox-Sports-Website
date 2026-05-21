import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Terms() {
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
            <h1 className="info-title">Terms & Conditions</h1>
            <span className="info-date">Last Updated: May 2026</span>
          </div>

          <div className="info-content">
            <p>Welcome to <strong>FitBox Sports</strong>. These terms and conditions outline the rules and regulations for the use of our website and services.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use FitBox Sports if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h2>2. User Accounts</h2>
            <p>If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security.</p>

            <h2>3. Products and Pricing</h2>
            <p>All products listed on the website are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.</p>

            <h2>4. Returns and Refunds</h2>
            <p>We want you to be completely satisfied with your purchase. If you are not satisfied, you may return the item within our standard return window in its original condition. Please refer to our Shipping & Returns policy for detailed instructions.</p>

            <h2>5. Limitation of Liability</h2>
            <p>In no event shall FitBox Sports, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>

            <h2>6. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
