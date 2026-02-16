import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function About() {
  const serviceAreas = [
    'Azheekal',
    'Karunagapally',
    'Oachira',
    'Chengannur',
    'Mavelikara',
    'Haripad',
    'Adoor',
    'Pandalam',
    'Chavara',
    'Kayamkulam',
    'Thiruvalla',
  ];

  const sectionStyle = { padding: '48px 16px', maxWidth: 1150, margin: '0 auto' };
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sea-50)', color: 'var(--text)' }}>
      <div style={sectionStyle}>
        <header style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--sea-600)', margin: 0 }}>Fish Cart</h1>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sea-600)', marginTop: 6 }}>From Sea to Door</h2>
          <p style={{ marginTop: 10, color: 'var(--text)' }}>Bringing the true taste of the ocean directly to your kitchen.</p>
        </header>

        <section style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--sea-600)', margin: 0 }}>Our Story</h2>
          <p style={{ marginTop: 12, lineHeight: 1.7, color: 'var(--text)', fontSize: 15 }}>
            Welcome to Fish Cart, your trusted local online fish market. We believe that everyone deserves access to fresh, safe, and delicious seafood. We started Fish Cart with a simple mission: to say goodbye to chemically treated fish and bring the true taste of the ocean directly to your kitchen.
          </p>
        </section>

        <section style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--sea-600)', margin: 0 }}>Sourced with Care</h3>
          <p style={{ marginTop: 12, lineHeight: 1.7, color: 'var(--text)', fontSize: 15 }}>
            We skip the middlemen and the long storage times. Every day, we source our fish directly from the traditional day-boats and hooks at the Azheekkal Harbour. By bringing the daily catch straight from the shore to your door, we ensure that you get exactly what nature intended.
          </p>
        </section>

        <section style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, borderLeft: '4px solid var(--sea-600)', boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--sea-600)', margin: 0 }}>The Fish Cart Promise: 100% Chemical Free</h3>
          <p style={{ marginTop: 12, lineHeight: 1.7, color: 'var(--text)', fontSize: 15 }}>
            Your family's health is our top priority. We guarantee that all our seafood is completely free from Formalin, Ammonia, and any other harmful preservatives. What you get is pure, natural, and safe fish—every single time.
          </p>
        </section>

        <section style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--sea-600)', margin: 0 }}>Our Method</h3>
          <p style={{ marginTop: 12, color: 'var(--text)', fontSize: 15 }}>We operate on a simple three-step model:</p>

          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 260px', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
              <div style={{ fontWeight: 800, color: 'var(--sea-600)', fontSize: 16 }}>1. Browse & Order</div>
              <div style={{ marginTop: 8, color: '#6b7280' }}>Browse and choose your fresh fish during our daily order window.</div>
              <div style={{ marginTop: 12, color: '#374151', fontWeight: 700 }}>Order Window: <span style={{ fontWeight: 800 }}>5:00 PM — 12:00 AM</span></div>
            </div>

            <div style={{ flex: '1 1 260px', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
              <div style={{ fontWeight: 800, color: 'var(--sea-600)', fontSize: 16 }}>2. We Prepare</div>
              <div style={{ marginTop: 8, color: '#6b7280' }}>Our expert team cleans and prepares your order exactly to your preference. We guarantee fresh handling and 100% hygienic preparation.</div>
            </div>

            <div style={{ flex: '1 1 260px', background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 8px 24px rgba(12,74,63,0.03)' }}>
              <div style={{ fontWeight: 800, color: 'var(--sea-600)', fontSize: 16 }}>3. Delivery</div>
              <div style={{ marginTop: 8, color: '#6b7280' }}>We dispatch your custom-prepared order, carefully packed in ice to lock in freshness.</div>
              <div style={{ marginTop: 12, color: '#374151', fontWeight: 700 }}>Delivery Window: <span style={{ fontWeight: 800 }}>Next Day Morning</span></div>
            </div>
          </div>
        </section>

        <section style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sea-600)' }}>Proudly Serving Our Community</h3>
          <p style={{ marginTop: 8, color: 'var(--text)' }}>
            We are a hyperlocal delivery service dedicated to bringing the freshest catch to our region. We currently provide doorstep delivery to homes in:
          </p>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 12, color: 'var(--text)' }}>
            {serviceAreas.map((area) => (
              <li key={area} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--sea-600)', display: 'inline-block' }} />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sea-600)' }}>Get in Touch</h3>
          <div style={{ marginTop: 8, lineHeight: 1.6, color: 'var(--text)' }}>
            <div><strong>WhatsApp / Call:</strong> <a href="tel:7594046060" style={{ color: 'var(--sea-600)', textDecoration: 'none' }}>7594046060</a></div>
            <div style={{ marginTop: 6 }}><strong>Head Office:</strong> Azheekkal</div>
            <div style={{ marginTop: 6 }}><strong>FSSAI License No:</strong> 11320002000362</div>
          </div>
        </section>
      </div>

      {/* centralized footer */}
      <div id="global-footer" />

      {/* fixed back-to-top button for About page */}
      <button
        onClick={scrollTop}
        aria-label="Back to top"
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          background: 'var(--sea-600)',
          borderRadius: 999,
          padding: 12,
          border: 'none',
          zIndex: 1000,
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowUp color="#fff" />
      </button>
    </div>
  );
}

