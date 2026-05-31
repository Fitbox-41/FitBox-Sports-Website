import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Sitemap() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sitemapData = [
    {
      title: "Shop",
      links: [
        { label: "Home / All Products", path: "/" },
        { label: "Dumbbells", path: "/category/dumbbells" },
        { label: "Balls", path: "/category/balls" },
        { label: "Gloves", path: "/category/gloves" },
        { label: "Accessories", path: "/category/accessories" },
        { label: "Under ₹99", path: "/under99" }
      ]
    },
    {
      title: "Support & Policies",
      links: [
        { label: "Track Order", path: "/orders" },
        { label: "Return & Cancellation Policy", path: "/returns" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms & Conditions", path: "/terms" },
        { label: "Shipping Information", path: "/shipping" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About FitBox", path: "/about" },
        { label: "Meet Our Team", path: "/team" },
        { label: "Contact Us", path: "/contact" },
        { label: "FAQ / Help Center", path: "/faq" }
      ]
    },
    {
      title: "Account",
      links: [
        { label: "My Account", path: "/account" },
        { label: "Shopping Cart", path: "/cart" },
        { label: "My Favourites", path: "/favourites" },
        { label: "Order History", path: "/orders" },
        { label: "Login / Register", path: "/auth" }
      ]
    }
  ];

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Sitemap</h1>
        <p className="info-hero-subtitle">Find everything you need on FitBox Sports in one place.</p>
      </section>

      <div className="info-container wide">
        <div className="info-card" style={{ padding: '48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            {sitemapData.map((section, idx) => (
              <div key={idx}>
                <h3 style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontSize: '1.2rem', 
                  color: 'var(--primary)', 
                  borderBottom: '2px solid var(--border)', 
                  paddingBottom: '12px',
                  marginBottom: '20px'
                }}>
                  {section.title}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} style={{ marginBottom: '12px' }}>
                      <Link 
                        to={link.path} 
                        style={{ 
                          color: 'var(--text-mid)', 
                          textDecoration: 'none', 
                          fontSize: '0.98rem',
                          transition: 'color 0.2s',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--primary)';
                          e.target.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-mid)';
                          e.target.style.transform = 'translateX(0)';
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
