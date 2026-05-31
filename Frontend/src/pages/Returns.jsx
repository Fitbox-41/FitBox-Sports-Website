import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Returns() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Return & Cancellation Policy</h1>
        <p className="info-hero-subtitle">Clear and transparent guidelines for returning products and cancelling orders.</p>
      </section>

      <div className="info-container">
        <div className="info-card">
          <div className="info-section-head">
            <h2 className="info-title">Returns & Cancellations</h2>
            <span className="info-date">Last Updated: May 2026</span>
          </div>

          <div className="info-body">
            <h2>1. Order Cancellation</h2>
            <p>You can cancel your order free of charge before it has been dispatched from our warehouse. Usually, orders are processed within 12-24 hours. If you wish to cancel, please <a href="/contact">contact us</a> immediately with your Order ID.</p>
            <p>Once an order has been shipped, it cannot be cancelled. You will need to receive the item and initiate a return following our return policy below.</p>

            <h2>2. 7-Day Return Policy</h2>
            <p>We accept returns up to <strong>7 days</strong> after delivery. To be eligible for a return, your item must meet the following criteria:</p>
            <ul>
              <li>The item must be unused and in the exact same condition that you received it.</li>
              <li>The item must be in its original packaging with all tags, accessories, and manuals included.</li>
              <li>You must have the receipt or proof of purchase.</li>
            </ul>

            <h2>3. Non-Returnable Items</h2>
            <p>Certain types of items cannot be returned due to hygiene and safety reasons:</p>
            <ul>
              <li>Used or worn fitness accessories (like gloves, wrist wraps).</li>
              <li>Items purchased during clearance sales or marked as "Final Sale".</li>
              <li>Gift cards.</li>
            </ul>

            <h2>4. Return Process</h2>
            <p>To initiate a return, please send an email to <strong>fitboxsports01@gmail.com</strong> with your Order Number and the reason for return. You may be asked to provide photographs of the item.</p>
            <p>If your return is approved, we will provide instructions on how and where to send your package. <strong>Return shipping costs are the responsibility of the customer</strong>, unless the return is due to a defective or incorrect item sent by us.</p>

            <h2>5. Refunds</h2>
            <p>Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed and a credit will automatically be applied to your original method of payment within 5-7 business days.</p>

            <h2>6. Damaged or Defective Items</h2>
            <div className="info-notice">
              <p>In the event that your order arrives damaged or defective, please email us within 48 hours of delivery with photos of the product and packaging. We will arrange a replacement or full refund at no extra cost to you.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
