import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users } from 'lucide-react';

const ROLE_LABELS = { admin: 'Admin', partner: 'Delivery Partner', user: 'Customer' };

export default function SwitchUser() {
  const { user, switchUser, getStoredRoles } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const stored = getStoredRoles();
  const others = stored.filter((r) => r !== user?.role);
  if (others.length === 0) return null;

  const handleSwitch = async (role) => {
    setOpen(false);
    const newUser = await switchUser(role);
    if (newUser?.role === 'admin') navigate('/admin');
    else if (newUser?.role === 'partner') navigate('/partner');
    else navigate('/');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          color: '#64748b',
        }}
        title="Switch to another user"
      >
        <Users size={16} />
        <span>Switch user</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 6,
              minWidth: 160,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 20,
              padding: 4,
            }}
          >
            {others.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSwitch(role)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#334155',
                  borderRadius: 6,
                }}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
