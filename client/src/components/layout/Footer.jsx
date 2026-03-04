import { Link } from 'react-router-dom';
import { Fish } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer style={{ background: 'linear-gradient(90deg,#042a3a 0%, #07344a 50%, #082e45 100%)', color: '#e6eef6', position: 'relative' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', padding: '48px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Left column: brand + tagline */}
        <div style={{ flex: 1, maxWidth: 360 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Fish size={22} style={{ color: '#7dd3fc' }} />
            </div>
            <span style={{ fontWeight: 800, color: '#f0fbff', fontSize: 20 }}>Fish Cart</span>
          </div>
          <div style={{ marginTop: 10, fontWeight: 700, color: '#f0fbff' }}>FROM SEA TO DOOR</div>
          <p style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
            Bringing the true taste of the ocean directly to your kitchen.
          </p>
        </div>

        {/* Middle column: quick links (hidden for delivery partners) */}
        {user?.role !== 'partner' && (
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f0fbff', fontWeight: 700, marginBottom: 8 }}>Quick Links</div>
            <ul style={{ marginTop: 8, listStyle: 'none', padding: 0, color: 'rgba(255,255,255,0.85)' }}>
              <li style={{ marginBottom: 8 }}><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Home</Link></li>
              <li style={{ marginBottom: 8 }}><Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>About Us</Link></li>
              <li style={{ marginBottom: 8 }}>
                {user ? (
                  <Link to="/orders" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>My Orders</Link>
                ) : (
                  <Link to="/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Login</Link>
                )}
              </li>
            </ul>
          </div>
        )}

        {/* Right column: contact */}
        <div style={{ flex: 1, maxWidth: 320 }}>
          <div style={{ color: '#f0fbff', fontWeight: 700, marginBottom: 8 }}>Contact Us</div>
          <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.95)', fontSize: 14, lineHeight: 1.6 }}>
            <div>📍 Head Office: Azheekkal Branch, Kerala</div>
            <div>📞 Call / WhatsApp: <a href="tel:+917594046060" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>+91 7594046060</a></div>
            <div>✉️ Email: <a href="mailto:fishcart@gmail.com" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none' }}>fishcart@gmail.com</a></div>
            <div>🛒 Order Window: 5:00 PM to 12:00 AM (Daily)</div>
            <div>🛵 Delivery Window: Next Day Morning</div>
          </div>
        </div>
      </div>

      {/* accent line */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1150, margin: '0 auto' }}>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          <div>© 2026 Fish Cart. All Rights Reserved.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} />
      </div>
    </footer>
  );
}

