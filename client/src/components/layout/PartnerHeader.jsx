import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const PartnerHeader = () => {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);

  return (
    <header style={{ background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div>
          <a href="/partner" style={{ color: '#0f766e', fontSize: 18, fontWeight: 700, textDecoration: 'none' }}>
            Delivery Partner
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
            <input type="checkbox" checked={online} onChange={() => setOnline((s) => !s)} style={{ width: 16, height: 16 }} />
            <span>{online ? 'Online' : 'Offline'}</span>
          </label>
          <div style={{ padding: '6px 10px', borderRadius: 20, border: '1px solid #e5e7eb' }}>{user?.name || 'Partner'}</div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;

