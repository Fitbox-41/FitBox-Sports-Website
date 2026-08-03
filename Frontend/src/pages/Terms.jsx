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

      <section className="info-hero">
        <h1 className="info-hero-title">Terms & Conditions</h1>
        <p className="info-hero-subtitle">The rules and guidelines for using the FitBox Sports platform and services.</p>
      </section>

      <div className="info-container">
        <div className="info-card">
          <div className="info-section-head">
            <h2 className="info-title">Terms of Service</h2>
            <span className="info-date">Last Updated: May 2026</span>
          </div>

          <div className="info-body">
            <p>Welcome to <strong>FitBox Sports</strong>. These terms and conditions outline the rules and regulations for the use of our website and services.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing this website, we assume you accept these terms and conditions. Do not continue to use FitBox Sports if you do not agree to take all of the terms and conditions stated on this page.</p>

            <h2>2. User Accounts</h2>
            <p>If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security.</p>

            <h2>3. Products and Pricing</h2>
            <p>All products listed on the website are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the Service.</p>

            <h2>4. Returns and Refunds</h2>
            <p>We want you to be completely satisfied with your purchase. If you are not satisfied, you may return the item within our standard return window in its original condition. Please refer to our <a href="/returns">Return & Cancellation Policy</a> for detailed instructions.</p>

            <h2>5. FitBox Points &amp; Rewards</h2>
            <p>FitBox Points are a promotional loyalty reward earned through activity in the FitBox app (for example, recording runs or completing challenges) and other promotions we may run from time to time. By earning or redeeming points you agree to the following:</p>
            <ul>
              <li><strong>Value.</strong> Each point has a redemption value of <strong>₹0.10 (ten paise)</strong> when applied to an eligible order. This value is for redemption only.</li>
              <li><strong>No cash value.</strong> Points are not money, carry no cash value, and cannot be transferred, sold, exchanged for cash, or withdrawn.</li>
              <li><strong>Redemption limit.</strong> Points may be redeemed for a discount of <strong>up to 50% of an order's value</strong>. The remaining balance must be paid using a standard payment method.</li>
              <li><strong>Earning.</strong> Points are credited for genuine in-app activity only. We do not sync or reward activity from third-party services such as Apple Health or Google Health Connect.</li>
              <li><strong>Expiry &amp; changes.</strong> We may change the earn rate, redemption value, redemption limit, or expire unused points, and may modify or discontinue the programme, at any time with or without notice.</li>
              <li><strong>Misuse.</strong> We may withhold, reduce, or revoke points and suspend accounts where we reasonably suspect fraud, error, abuse, or any breach of these terms. Our determination is final.</li>
              <li><strong>Refunds.</strong> If an order paid partly with points is cancelled or refunded, the redeemed points are returned to your wallet; the cash portion is refunded per our Return &amp; Cancellation Policy.</li>
            </ul>

            <h2>6. Limitation of Liability</h2>
            <p>In no event shall FitBox Sports, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this website.</p>

            <h2>7. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of Punjab, India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
