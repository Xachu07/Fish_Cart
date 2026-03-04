import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PartnerHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  const triggerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    padding: '8px 14px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
    fontFamily: 'inherit',
  };
  const menuStyle = {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: 8,
    minWidth: 200,
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  };
  const menuItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#374151',
    textAlign: 'left',
    fontFamily: 'inherit',
    textDecoration: 'none',
    boxSizing: 'border-box',
  };

  return (
    <header style={{ position: 'relative', zIndex: 50, background: '#ffffff', borderBottom: '2px solid #e6f6f3' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/partner" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif', fontWeight: 800, color: 'var(--sea-600)', fontSize: 18 }}>Fish Cart</span>
          </Link>
        </div>

        <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Link to="/partner" style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(15,118,110,0.06)', color: 'var(--sea-600)', textDecoration: 'none', fontSize: 14 }}>Delivery</Link>
          <Link to="/partner/history" style={{ padding: '6px 14px', borderRadius: 20, color: '#475569', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Delivery History</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen((s) => !s); }}
              style={triggerStyle}
              aria-expanded={open}
              aria-haspopup="true"
            >
              <User size={18} style={{ color: 'var(--sea-600)', flexShrink: 0 }} />
              <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Partner'}</span>
            </button>
            {open && (
              <div style={menuStyle} role="menu">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{user?.name || 'Partner'}</div>
                  {user?.email && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{user.email}</div>}
                </div>
                <Link
                  to="/partner/profile"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  style={{ ...menuItemStyle, borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = 'var(--sea-600)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151'; }}
                >
                  <User size={18} style={{ flexShrink: 0, opacity: 0.9 }} />
                  Profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  style={menuItemStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#b91c1c'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151'; }}
                >
                  <LogOut size={18} style={{ flexShrink: 0, opacity: 0.9 }} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartnerHeader;
