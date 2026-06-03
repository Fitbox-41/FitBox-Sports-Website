import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('error');
    }
    setTimeout(() => setStatus(''), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Contact Us</h1>
        <p className="info-hero-subtitle">Have questions about our equipment, your order, or need fitness advice? We're here to help.</p>
      </section>

      <div className="info-container wide">
        <div className="info-card">
          <div className="contact-grid">
            <div className="contact-card-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <div className="contact-card-label">Phone Support</div>
                <div className="contact-card-value"><a href="tel:+918568989898">+91 85689 89898</a></div>
                <div className="contact-card-value" style={{ fontSize: '0.85rem', color: 'var(--text-mid)', marginTop: '4px' }}>Mon - Fri, 9am - 6pm IST</div>
              </div>
            </div>

            <div className="contact-card-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <div className="contact-card-label">Email Us</div>
                <div className="contact-card-value"><a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`}>{import.meta.env.VITE_CONTACT_EMAIL}</a></div>
                <div className="contact-card-value" style={{ fontSize: '0.85rem', color: 'var(--text-mid)', marginTop: '4px' }}>We reply within 24 hours</div>
              </div>
            </div>
            {/* Address */}
            <div className="contact-card-item">
              <div className="contact-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>

              <div>
                <div className="contact-card-label">Our Address</div>

                <div className="contact-card-value">
                  <strong>FitBox Sports</strong>
                </div>

                <div
                  className="contact-card-value"
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-mid)",
                    marginTop: "4px",
                  }}
                >
                  41, Warirana Industrial Complex, Jalandhar
                </div>

                <div
                  className="contact-card-value"
                  style={{
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  <a href="tel:+918568989898">+91 85689 89898</a>
                </div>
              </div>
            </div>

          </div>

          <div className="contact-form-wrap">
            <h3 className="contact-form-title">Send us a message</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Alan Turing" />
              </label>
              <label>
                Email
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" />
              </label>
              <label className="full-width">
                Subject
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="How can we help?" />
              </label>
              <label className="full-width">
                Message
                <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Tell us more about your inquiry..."></textarea>
              </label>
              <div className="contact-submit">
                <button type="submit" className="contact-btn" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {status === 'success' && (
                <div className="contact-success">Your message has been sent successfully! We will get back to you soon.</div>
              )}
              {status === 'error' && (
                <div className="contact-error" style={{ color: 'red', marginTop: '10px' }}>Failed to send message. Please try again later.</div>
              )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
