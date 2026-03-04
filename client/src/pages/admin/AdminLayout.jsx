import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Users, MapPin, Truck, Menu, X, User, LogOut, Fish } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerOpen, setHeaderOpen] = useState(false);
  const headerDropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!headerOpen) return;
    const handleClickOutside = (e) => {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(e.target)) setHeaderOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [headerOpen]);

  const handleAdminLogout = () => {
    setHeaderOpen(false);
    logout();
    navigate('/');
  };

  const [isExpanded, setIsExpanded] = useState(false); // collapsed by default
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setIsExpanded(false);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const collapsedWidth = 72;
  const expandedWidth = 260;
  const sidebarWidth = isExpanded ? expandedWidth : collapsedWidth;
  const sidebarStyle = {
    width: sidebarWidth,
    background: '#0f1724',
    color: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    transition: 'width 180ms ease',
    overflow: 'hidden',
  };
  const headerLogoStyle = { height: 64, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' };
  const navStyle = { flex: 1, padding: '18px 12px', overflowY: 'auto' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* LEFT SIDEBAR */}
      <aside
        className="admin-print-hide"
        style={{
          ...sidebarStyle,
          background: 'linear-gradient(180deg,#071827 0%, #062231 100%)',
          boxShadow: '2px 0 12px rgba(2,6,23,0.12)',
        }}
        onMouseEnter={() => { if (!isMobile) setIsExpanded(true); }}
        onMouseLeave={() => { if (!isMobile) setIsExpanded(false); }}
      >
        <div style={headerLogoStyle}>
          <Link to="/admin" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#08303a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Fish size={20} style={{ color: '#7dd3fc' }} />
            </div>
            {isExpanded && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Fishcart</span>}
          </Link>
        </div>
        <nav style={{ ...navStyle, paddingTop: 20 }}>
          {[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/products', label: 'Daily Catch', icon: Package },
            { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            { to: '/admin/packing', label: 'Packing List', icon: ClipboardList },
            { to: '/admin/areas', label: 'Areas', icon: MapPin },
            { to: '/admin/users', label: 'Customers', icon: Users },
            { to: '/admin/delivery-partners', label: 'Delivery Partner', icon: Truck },
          ].map((item) => {
            const Icon = item.icon;
            const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: isExpanded ? '12px 14px' : '12px 10px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: active ? '#fff' : '#cbd5e1',
                    background: active ? 'linear-gradient(90deg,#073240, #03313a)' : 'transparent',
                    marginBottom: 8,
                    transition: 'background 160ms ease, color 160ms ease',
                  }}
                >
                  <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: active ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                    <Icon size={18} style={{ color: active ? '#fff' : '#9fb0bf' }} />
                  </div>
                  {isExpanded && <span style={{ fontSize: 14 }}>{item.label}</span>}
                </Link>
              );
          })}
        </nav>
      </aside>

      {/* MOBILE SIDEBAR (overlay) */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} className="md:hidden admin-print-hide">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 260, background: '#0f1724', color: '#cbd5e1', padding: 16 }}>
            <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <Link to="/admin" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#08303a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Fish size={20} style={{ color: '#7dd3fc' }} />
                </div>
                Fishcart
              </Link>
              <button style={{ marginLeft: 'auto', padding: 6 }} onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} style={{ color: '#cbd5e1' }} />
              </button>
            </div>
            <nav style={{ marginTop: 12 }}>
              {[
                { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/admin/products', label: 'Daily Catch', icon: Package },
                { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
                { to: '/admin/packing', label: 'Packing List', icon: ClipboardList },
                { to: '/admin/areas', label: 'Areas', icon: MapPin },
                { to: '/admin/users', label: 'Customers', icon: Users },
                { to: '/admin/delivery-partners', label: 'Delivery Partner', icon: Truck },
              ].map((item) => {
                const active = item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 8px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: active ? '#fff' : '#cbd5e1',
                      background: active ? '#032b3b' : 'transparent',
                      marginBottom: 6,
                    }}
                  >
                    <Icon size={18} style={{ color: active ? '#fff' : '#94a3b8' }} />
                    <span style={{ fontSize: 14 }}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div
        className="flex-1 flex flex-col overflow-hidden admin-print-main"
        style={{
          // add extra gutter space to the left so main content is indented away from the sidebar
          marginLeft: isMobile ? 0 : ((isExpanded ? expandedWidth : collapsedWidth) + 24),
          transition: 'margin-left 200ms ease',
          boxSizing: 'border-box',
          paddingRight: 24,
        }}
      >
        {/* TOP HEADER - consistent with customer header */}
        <header
          className="admin-print-hide"
          style={{
            background: '#ffffff',
            borderBottom: '2px solid #e6f6f3',
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : (isExpanded ? expandedWidth + 24 : collapsedWidth + 24),
            right: 0,
            zIndex: 60,
          }}
        >
          <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(15,118,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Fish size={20} style={{ color: 'var(--sea-600)' }} />
                </div>
                <span style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif', fontWeight: 800, color: 'var(--sea-600)', fontSize: 18 }}>Fish Cart</span>
              </Link>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginLeft: 4 }}>Admin</span>
            </div>

            <div style={{ flex: 1 }} />
            <div ref={headerDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setHeaderOpen((s) => !s); }}
                aria-expanded={headerOpen}
                aria-haspopup="true"
                style={{
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
                }}
              >
                <User size={18} style={{ color: 'var(--sea-600)', flexShrink: 0 }} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
              </button>
              {headerOpen && (
                <div
                  style={{
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
                    zIndex: 70,
                  }}
                  role="menu"
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{user.name}</div>
                    {user.email && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{user.email}</div>}
                  </div>
                  <Link
                    to="/admin/profile"
                    onClick={() => setHeaderOpen(false)}
                    role="menuitem"
                    style={{
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
                      borderBottom: '1px solid #f1f5f9',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = 'var(--sea-600)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#374151'; }}
                  >
                    <User size={18} style={{ flexShrink: 0, opacity: 0.9 }} />
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleAdminLogout}
                    style={{
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
                      boxSizing: 'border-box',
                    }}
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
        </header>

        {/* spacer for fixed header */}
        <div className="admin-print-hide" style={{ height: 64 }} />

        {/* PAGE CONTENT — full width for admin screens */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ boxSizing: 'border-box' }}>
          <div style={{ width: '100%', margin: 0, padding: 0 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

