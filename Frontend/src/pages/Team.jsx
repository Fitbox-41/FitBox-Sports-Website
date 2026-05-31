import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './InfoPages.css';

export default function Team() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamMembers = [
    {
      name: "Rahul Sharma",
      role: "Founder & CEO",
      bio: "Former professional athlete with 15+ years in the fitness industry. Rahul founded FitBox to make premium gear accessible."
    },
    {
      name: "Priya Desai",
      role: "Head of Product",
      bio: "Industrial designer passionate about ergonomics. Priya ensures every piece of equipment feels right and performs perfectly."
    },
    {
      name: "Arjun Reddy",
      role: "Logistics Director",
      bio: "Supply chain expert who makes sure your heavy lifting equipment arrives quickly and safely to your doorstep."
    }
  ];

  return (
    <div className="info-page">
      <Header hideSubHeader={true} hideSaleRibbon={true} />
      <div className="header-spacer" style={{ height: '70px' }} />

      <section className="info-hero">
        <h1 className="info-hero-title">Meet Our Team</h1>
        <p className="info-hero-subtitle">The fitness enthusiasts and industry experts behind FitBox Sports.</p>
      </section>

      <div className="info-container wide">
        <div className="info-card info-card-padded">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {teamMembers.map((member, index) => (
              <div key={index} style={{
                background: 'var(--bg)',
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 20px rgba(255,107,53,0.3)'
                }}>
                  {member.name.charAt(0)}
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '4px', color: 'var(--text-dark)' }}>{member.name}</h3>
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{member.role}</div>
                <p style={{ color: 'var(--text-mid)', fontSize: '0.95rem', lineHeight: '1.6' }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
