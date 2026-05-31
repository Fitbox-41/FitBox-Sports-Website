import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function FAQ() {
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqs = [
    {
      category: "Orders & Shipping",
      items: [
        { id: 'q1', q: "How long does shipping take?", a: "Standard shipping typically takes 3-5 business days. We process all orders within 1-2 business days. You will receive a tracking link as soon as your order leaves our warehouse." },
        { id: 'q2', q: "Do you ship internationally?", a: "Currently, FitBox Sports only ships within India. We do not offer international shipping at this time." },
        { id: 'q3', q: "How can I track my order?", a: "Once your order is dispatched, you will receive an email with a tracking number. You can also log into your account and view the tracking details under the 'Orders' section." }
      ]
    },
    {
      category: "Returns & Refunds",
      items: [
        { id: 'q4', q: "What is your return policy?", a: "We offer a 7-day return policy for items in unused and original condition. Please refer to our Return & Cancellation Policy page for detailed instructions." },
        { id: 'q5', q: "How long does it take to process a refund?", a: "Once we receive and inspect your returned item, refunds are processed within 5-7 business days back to your original payment method." }
      ]
    },
    {
      category: "Products & Stock",
      items: [
        { id: 'q6', q: "Are your dumbbells sold as pairs or singles?", a: "Product descriptions will explicitly state if they are sold as singles or pairs. Most of our standard dumbbells are sold as pairs, while heavier hex dumbbells may be sold individually." },
        { id: 'q7', q: "What should I do if an item is out of stock?", a: "You can click the 'Notify Me' button on the product page to receive an email alert the moment the item is restocked." }
      ]
    }
  ];

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Frequently Asked Questions</h1>
        <p className="info-hero-subtitle">Find quick answers to common questions about our products, shipping, and returns.</p>
      </section>

      <div className="info-container">
        <div className="info-card">
          <div className="faq-list">
            {faqs.map((group, idx) => (
              <div key={idx}>
                <h3 className="faq-category-title">{group.category}</h3>
                {group.items.map(item => (
                  <div key={item.id} className={`faq-item ${openItems[item.id] ? 'open' : ''}`}>
                    <button className="faq-question" onClick={() => toggleItem(item.id)}>
                      {item.q}
                      <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <div className="faq-answer" style={{ maxHeight: openItems[item.id] ? '300px' : '0' }}>
                      <div className="faq-answer-inner">
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
