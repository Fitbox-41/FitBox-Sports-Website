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

      <section className="info-hero" style={{ padding: '60px 20px', background: '#111827', color: 'white' }}>
        <h1 className="info-hero-title" style={{ color: 'white' }}>Leadership & Vision</h1>
        <p className="info-hero-subtitle" style={{ color: '#9ca3af' }}>The driving force behind FitBox Sports.</p>
      </section>

      <div className="info-container wide" style={{ paddingTop: '60px' }}>
        
        {/* Founder Message - Professional Letter Style */}
        <div className="info-card" style={{ marginBottom: '60px', padding: '60px', background: '#fff', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', borderRadius: '12px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '30px', color: '#111827', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>A Message from the Founder</h2>
            
            <div style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <p style={{ marginBottom: '20px' }}>
                Welcome to FitBox Sports. 
              </p>
              <p style={{ marginBottom: '20px' }}>
                When I first established FitBox, the fitness industry was divided between overpriced premium brands and low-quality alternatives that couldn't withstand rigorous training. I realized there was a critical gap in the market for high-performance, meticulously engineered equipment that remained accessible to everyone—from commercial gym owners to dedicated home athletes.
              </p>
              <p style={{ marginBottom: '20px' }}>
                Over the years, we have invested heavily in research, biomechanics, and material science to ensure that every dumbbell, rack, and machine that bears the FitBox name represents the pinnacle of durability and functional design. We don't believe in compromises. Our manufacturing processes are subjected to strict quality control, and our designs are continuously iterated upon based on feedback from professional athletes and trainers.
              </p>
              <p style={{ marginBottom: '30px' }}>
                Fitness is not just a hobby; for many of us, it is a foundation for a disciplined and resilient life. Our goal is to provide you with the tools necessary to build that foundation. Whether you are outfitting a massive commercial facility or setting up a garage gym, we are committed to being the reliable partner you can trust for the heavy lifting. Thank you for making FitBox Sports a part of your journey.
              </p>
              
              <div style={{ textAlign: 'right', marginTop: '40px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                <div style={{ fontWeight: '700', color: '#111827', fontSize: '1.1rem', marginBottom: '4px' }}>Gaurav Arora</div>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Founder & CEO, FitBox Sports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision and Mission */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '80px' }}>
          
          {/* Mission */}
          <div className="info-card" style={{ padding: '50px', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none' }}>
            <div style={{ width: '48px', height: '48px', background: '#ff6b35', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '24px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '16px', color: '#111827' }}>Our Mission</h3>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.7' }}>
              Our mission is to engineer and manufacture commercial-grade fitness equipment that seamlessly blends biomechanical excellence with rugged durability. We aim to empower facility owners and individuals by providing state-of-the-art strength and conditioning tools that maximize athletic potential while ensuring uncompromised safety. Through relentless innovation and direct-to-consumer value, we are democratizing access to elite-level training hardware.
            </p>
          </div>

          {/* Vision */}
          <div className="info-card" style={{ padding: '50px', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: 'none' }}>
            <div style={{ width: '48px', height: '48px', background: '#111827', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '24px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '16px', color: '#111827' }}>Our Vision</h3>
            <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.7' }}>
              We envision a future where FitBox Sports is recognized as the global standard for heavy-duty fitness infrastructure. We strive to foster a worldwide community of resilient, health-driven individuals by consistently setting the benchmark for equipment reliability, customer support, and design ingenuity. We look forward to outfitting the next generation of world-class training facilities and transformative home gyms across the globe.
            </p>
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}
