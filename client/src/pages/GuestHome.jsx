import { useNavigate } from 'react-router-dom';
import { Fish, Scissors, Truck } from 'lucide-react';

export default function GuestHome() {
  const navigate = useNavigate();

  const sectionStyle = { padding: '48px 16px', maxWidth: 1150, margin: '0 auto' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sea-50)', color: 'var(--text)' }}>
      {/* HERO */}
      <section style={{ position: 'relative' }}>
            <div
          style={{
            height: '62vh',
            width: '100%',
            backgroundImage: "url('/assets/hero.png')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.2))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={sectionStyle}>
            <div style={{ maxWidth: 700, color: '#fff' }}>
              <h1 style={{ fontSize: 'clamp(36px,6vw,48px)', fontWeight: 900, margin: 0 }}>Fish Cart</h1>
              <h2 style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 700, marginTop: 6 }}>From Sea To Door</h2>
              <p style={{ marginTop: 12, fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>
                100% Chemical-Free and Formalin-Free<br />
                Bringing the true taste of the ocean directly to your kitchen.
              </p>
              <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                <button onClick={() => navigate('/register')} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                  View Today's Catch
                </button>
                <button onClick={() => navigate('/about')} style={{ background: 'transparent', color: '#fff', padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}>
                  Learn More
                </button>
              </div>
              {/* small hero badges removed */}
            </div>
          </div>
        </div>
        {/* FSSAI and serving areas removed as requested */}
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '48px 16px' }}>
        <div style={sectionStyle}>
          {/* New short How It Works block */}
          <div style={{ maxWidth: 900, margin: '0 auto 20px', textAlign: 'center' }}>
          <h2 style={{ textAlign: 'center', fontSize: 24, color: 'var(--sea-600)', margin: 0 }}>How It Works?</h2>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px', maxWidth: 320, background: '#fff', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(12,74,63,0.04)' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--sea-600)', fontSize: 16 }}>1. Browse & Order</div>
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>Browse and choose fish during the order window.</div>
                </div>
                <div style={{ marginTop: 12, color: '#374151', fontWeight: 600 }}>Order Window: <span style={{ fontWeight: 700 }}>5:00 PM — 12:00 AM</span></div>
              </div>

              <div style={{ flex: '1 1 240px', maxWidth: 320, background: '#fff', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(12,74,63,0.04)' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--sea-600)', fontSize: 16 }}>2. We Prepare</div>
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>Our team cleans and prepares your order exactly to your preference.</div>
                </div>
                <div style={{ marginTop: 12, color: '#374151', fontWeight: 600 }}>Fresh handling and hygienic preparation</div>
              </div>

              <div style={{ flex: '1 1 240px', maxWidth: 320, background: '#fff', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(12,74,63,0.04)' }}>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--sea-600)', fontSize: 16 }}>3. Delivery</div>
                  <div style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>We dispatch your order carefully packed.</div>
                </div>
                <div style={{ marginTop: 12, color: '#374151', fontWeight: 600 }}>Delivery Window: <span style={{ fontWeight: 700 }}>Next Day Morning</span></div>
              </div>
            </div>
          </div>

          <h2 style={{ textAlign: 'center', fontSize: 24, color: 'var(--sea-600)', margin: 0 }}>Why Choose Fish Cart?</h2>
          {/* subtitle removed */}
          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <div style={{ width: 280, background: '#fff', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 6px 18px rgba(12,74,63,0.04)' }}>
              <div style={{ display: 'inline-flex', background: 'var(--sea-50)', padding: 12, borderRadius: 999 }}><Fish style={{ width: 22, height: 22, color: 'var(--sea-600)' }} /></div>
              <h3 style={{ marginTop: 12, fontWeight: 700 }}>Sourced Daily</h3>
              <p style={{ marginTop: 8, color: '#6b7280' }}>
                Straight from the boats of nearby Harbour. <br />
                No middlemen, No long storage.
              </p>
            </div>
            <div style={{ width: 280, background: '#fff', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 6px 18px rgba(12,74,63,0.04)' }}>
              <div style={{ display: 'inline-flex', background: 'var(--sea-50)', padding: 12, borderRadius: 999 }}><Scissors style={{ width: 22, height: 22, color: 'var(--sea-600)' }} /></div>
              <h3 style={{ marginTop: 12, fontWeight: 700 }}>Custom Cleaned</h3>
              <p style={{ marginTop: 8, color: '#6b7280' }}>
                Sliced, cleaned, and prepared exactly to your preference.<br />
                Ready to cook the moment it arrives.
              </p>
            </div>
            <div style={{ width: 280, background: '#fff', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 6px 18px rgba(12,74,63,0.04)' }}>
              <div style={{ display: 'inline-flex', background: 'var(--sea-50)', padding: 12, borderRadius: 999 }}><Truck style={{ width: 22, height: 22, color: 'var(--sea-600)' }} /></div>
              <h3 style={{ marginTop: 12, fontWeight: 700 }}>Doorstep Delivery</h3>
              <p style={{ marginTop: 8, color: '#6b7280' }}>
                Skip the crowded markets.<br />
                Relax at home while we deliver fresh seafood right to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      {/* SERVICE AREAS BANNER */}
      <section style={{ padding: '18px 16px', background: 'linear-gradient(90deg, rgba(15,118,110,0.04), rgba(255,255,255,0))' }}>
        <div style={sectionStyle}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)', fontWeight: 700 }}>Now Delivering To:</h3>
            <p style={{ marginTop: 8, color: '#374151', fontSize: 16 }}>
              Azheekal • Karunagapally • Oachira • Chengannur • Mavelikara • Haripad • Adoor • Pandalam • Chavara • Kayamkulam • Thiruvalla
            </p>
          </div>
        </div>
      </section>

      {/* TRUST FOOTER */}
      <div>
        {/* use centralized footer */}
      </div>
    </div>
  );
}

