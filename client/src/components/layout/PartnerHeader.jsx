import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PartnerHeader = () => {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);

  return (
    <header style={{ background: '#ffffff', borderBottom: '2px solid #e6f6f3' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div>
          <Link to="/partner" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif', fontWeight: 800, color: 'var(--sea-600)', fontSize: 18 }}>Delivery Partner</span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setOnline(s => !s)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 14,
              background: online ? 'var(--sea-600)' : '#f1f5f9',
              color: online ? '#fff' : '#334155',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {online ? 'Online' : 'Offline'}
          </button>
          <div style={{ padding: '6px 10px', borderRadius: 20, border: '1px solid #e5e7eb' }}>{user?.name || 'Partner'}</div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;

