import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  /* ── Footer Accordion state (Mobile) ── */
  const [openFooterCol, setOpenFooterCol] = useState(window.innerWidth <= 600 ? 'about' : null);

  const toggleFooterCol = (colId) => {
    setOpenFooterCol((prev) => (prev === colId ? null : colId));
  };

  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">

        {/* Col 1 – About + socials */}
        <div className={`footer-col footer-about ${openFooterCol === 'about' ? 'active' : ''}`} id="footer-about">
          <h4 className="footer-col-title" onClick={() => toggleFooterCol('about')}>
            About Us
            <span className="footer-accordion-icon">{openFooterCol === 'about' ? '×' : '+'}</span>
          </h4>
          <div className={`footer-col-content ${openFooterCol === 'about' ? 'open' : ''}`}>
            <div className="footer-logo">
              <img src="/fitbox-_red-white.webp" alt="FitBox Sports" className="footer-logo-img" loading="lazy" decoding="async" />
            </div>
            <p className="footer-tagline">
              Your ultimate fitness companion. Premium gym equipment delivered to your door.
            </p>

            {/* Social links – replace href with real URLs */}
            <div className="footer-socials" id="footer-socials">
              {[
                { 
                  name: 'X', 
                  url: 'https://x.com', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Instagram', 
                  url: 'https://instagram.com', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  )
                },
                { 
                  name: 'WhatsApp', 
                  url: 'https://wa.me/yournumber', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  )
                },
                { 
                  name: 'Mail', 
                  url: 'mailto:contact@fitboxsports.com', 
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  )
                },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  id={`social-${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2 – Quick links */}
        <div className={`footer-col ${openFooterCol === 'quick-links' ? 'active' : ''}`} id="footer-quick-links">
          <h4 className="footer-col-title" onClick={() => toggleFooterCol('quick-links')}>
            Quick Links
            <span className="footer-accordion-icon">{openFooterCol === 'quick-links' ? '×' : '+'}</span>
          </h4>
          <div className={`footer-col-content ${openFooterCol === 'quick-links' ? 'open' : ''}`}>
            <ul className="footer-links">
              {[
                { label: 'Home',    path: '/'        },
                { label: 'Team',    path: '/team'    },
                { label: 'About',   path: '/about'   },
                { label: 'FAQ',     path: '/faq'     },
                { label: 'Contact', path: '/contact' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="footer-link" id={`flink-${l.label.toLowerCase()}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Col 3 – Shop */}
        <div className={`footer-col ${openFooterCol === 'shop-links' ? 'active' : ''}`} id="footer-shop-links">
          <h4 className="footer-col-title" onClick={() => toggleFooterCol('shop-links')}>
            Shop
            <span className="footer-accordion-icon">{openFooterCol === 'shop-links' ? '×' : '+'}</span>
          </h4>
          <div className={`footer-col-content ${openFooterCol === 'shop-links' ? 'open' : ''}`}>
            <ul className="footer-links">
              {[
                { label: 'Dumbbells',    path: '/dumbbells'   },
                { label: 'Balls',        path: '/balls'        },
                { label: 'Gloves',      path: '/gloves'      },
                { label: 'Accessories',  path: '/accessories'  },
                { label: 'New Arrivals', path: '/new'          },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="footer-link" id={`slink-${l.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Col 4 – Support */}
        <div className={`footer-col ${openFooterCol === 'support-links' ? 'active' : ''}`} id="footer-support-links">
          <h4 className="footer-col-title" onClick={() => toggleFooterCol('support-links')}>
            Support
            <span className="footer-accordion-icon">{openFooterCol === 'support-links' ? '×' : '+'}</span>
          </h4>
          <div className={`footer-col-content ${openFooterCol === 'support-links' ? 'open' : ''}`}>
            <ul className="footer-links">
              {[
                { label: 'Track Order',   path: '/orders'   },
                { label: 'Return Policy', path: '/returns'  },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms',         path: '/terms'    },
                { label: 'Shipping Info', path: '/shipping' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.path} className="footer-link" id={`sulink-${l.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Col 5 – Brand logo image */}
        <div className={`footer-col footer-brand-col ${openFooterCol === 'brand-col' ? 'active' : ''}`} id="footer-brand-col">
          <h4 className="footer-col-title" onClick={() => toggleFooterCol('brand-col')}>
            FitBox Sports
            <span className="footer-accordion-icon">{openFooterCol === 'brand-col' ? '×' : '+'}</span>
          </h4>
          <div className={`footer-col-content ${openFooterCol === 'brand-col' ? 'open' : ''}`}>
            {/* Company logo image – replace this div with <img src="..." /> */}
            <div className="footer-brand-img-wrap" id="footer-brand-img">
              <img src="/fitbox-_red-white.webp" alt="FitBox Sports" className="footer-brand-img" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>

      </div>

      {/* Copyright bar */}
      <div className="footer-bottom" id="footer-copyright">
        <p>© {new Date().getFullYear()} FitBox Sports. All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy"  className="footer-bottom-link">Privacy</Link>
          <Link to="/terms"    className="footer-bottom-link">Terms</Link>
          <Link to="/sitemap"  className="footer-bottom-link">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}
