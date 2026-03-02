import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SwitchUser from '../SwitchUser';

const PartnerHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ background: '#ffffff', borderBottom: '2px solid #e6f6f3' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/partner" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif', fontWeight: 800, color: 'var(--sea-600)', fontSize: 18 }}>Fish Cart</span>
          </Link>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SwitchUser />
          <button
            onClick={() => setOnline(s => !s)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 14,
              background: online ? 'var(--sea-600)' : '#f1f5f9',
              color: online ? '#fff' : '#334155',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {online ? 'Online' : 'Offline'}
          </button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setOpen(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 20, border: '1px solid #e5e7eb', padding: '6px 10px', background: '#fff', cursor: 'pointer' }}>
              <User style={{ width: 16, height: 16 }} />
              <span style={{ display: 'inline-block', minWidth: 60 }}>{user?.name || 'Partner'}</span>
            </button>
            {open && (
              <div style={{ position: 'absolute', right: 0, marginTop: 8, width: 180, borderRadius: 8, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
                <Link to="/partner" onClick={() => setOpen(false)} style={{ display: 'block', padding: '8px 12px', color: '#374151', textDecoration: 'none' }}>Profile</Link>
                <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;
