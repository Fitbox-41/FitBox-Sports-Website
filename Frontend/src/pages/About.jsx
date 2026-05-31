import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">About FitBox Sports</h1>
        <p className="info-hero-subtitle">We believe premium fitness equipment should be accessible to everyone setting up their home gym.</p>
      </section>

      <div className="info-container wide">
        <div className="info-card">
          <div className="info-body">
            <h2>Fueling Your Fitness Journey</h2>
            <p>FitBox Sports was born out of a simple necessity: finding high-quality, durable, and aesthetically pleasing fitness equipment without the premium gym markup. We understand that your body is your most valuable asset, and the tools you use to train it should reflect that value.</p>
            
            <p>From our meticulously engineered dumbbells to our high-grip workout accessories, every product in our catalog undergoes rigorous testing. We don't just sell equipment; we equip you for a lifestyle of strength and vitality.</p>
            
            <h2>Why Choose FitBox?</h2>
            <div className="about-values">
              <div className="about-value-card">
                <div className="about-value-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg></div>
                <div className="about-value-title">Premium Quality</div>
                <div className="about-value-text">Industrial-grade materials built to withstand your toughest workouts, year after year.</div>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                <div className="about-value-title">Fast Shipping</div>
                <div className="about-value-text">Optimized logistics network ensuring your gear arrives quickly and safely.</div>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                <div className="about-value-title">Expert Support</div>
                <div className="about-value-text">Our team of fitness enthusiasts is always ready to guide you to the right equipment.</div>
              </div>
              <div className="about-value-card">
                <div className="about-value-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary)'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                <div className="about-value-title">Secure Shopping</div>
                <div className="about-value-text">100% secure checkout and robust privacy protocols to protect your data.</div>
              </div>
            </div>
          </div>
          
          <div className="about-stats">
            <div className="about-stat">
              <div className="about-stat-num">1M+</div>
              <div className="about-stat-label">Happy Customers</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">250+</div>
              <div className="about-stat-label">Premium Products</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-num">4.5</div>
              <div className="about-stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
