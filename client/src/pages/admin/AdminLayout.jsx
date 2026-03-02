import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Store, Users, MapPin, Truck, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerOpen, setHeaderOpen] = useState(false);
  const navigate = useNavigate();

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
        style={{
          ...sidebarStyle,
          background: 'linear-gradient(180deg,#071827 0%, #062231 100%)',
          boxShadow: '2px 0 12px rgba(2,6,23,0.12)',
        }}
        onMouseEnter={() => { if (!isMobile) setIsExpanded(true); }}
        onMouseLeave={() => { if (!isMobile) setIsExpanded(false); }}
      >
        <div style={headerLogoStyle}>
          <Link to="/admin" style={{ color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#08303a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </Link>
        </div>
        <nav style={{ ...navStyle, paddingTop: 20 }}>
          {[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/products', label: 'Products', icon: Package },
            { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            { to: '/admin/packing', label: 'Packing List', icon: ClipboardList },
            { to: '/admin/shop-status', label: 'Shop Status', icon: Store },
            { to: '/admin/areas', label: 'Areas', icon: MapPin },
            { to: '/admin/users', label: 'Customers', icon: Users },
            { to: '/admin/delivery-partners', label: 'Delivery Partner', icon: Truck },
          ].map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} className="md:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 260, background: '#0f1724', color: '#cbd5e1', padding: 16 }}>
            <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <Link to="/admin" style={{ color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none' }}>
                FishCart <span style={{ color: '#7dd3fc' }}>Admin</span>
              </Link>
              <button style={{ marginLeft: 'auto', padding: 6 }} onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={18} style={{ color: '#cbd5e1' }} />
              </button>
            </div>
            <nav style={{ marginTop: 12 }}>
              {[
                { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/admin/products', label: 'Products', icon: Package },
                { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
                { to: '/admin/packing', label: 'Packing List', icon: ClipboardList },
                { to: '/admin/shop-status', label: 'Shop Status', icon: Store },
                { to: '/admin/areas', label: 'Areas', icon: MapPin },
                { to: '/admin/users', label: 'Customers', icon: Users },
                { to: '/admin/delivery-partners', label: 'Delivery Partner', icon: Truck },
              ].map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.to);
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
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          // add extra gutter space to the left so main content is indented away from the sidebar
          marginLeft: isMobile ? 0 : ((isExpanded ? expandedWidth : collapsedWidth) + 24),
          transition: 'margin-left 200ms ease',
          boxSizing: 'border-box',
          paddingRight: 24,
        }}
      >
        {/* TOP HEADER - same style as customer page header */}
        <header
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
              <Link to="/admin" style={{ textDecoration: 'none' }}>
                <span style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif', fontWeight: 800, color: 'var(--sea-600)', fontSize: 18 }}>Fish Cart</span>
              </Link>
            </div>

            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setHeaderOpen((s) => !s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 20, border: '1px solid #e5e7eb', padding: '6px 10px', background: '#fff', cursor: 'pointer' }}
                >
                  <User style={{ width: 16, height: 16 }} />
                  <span style={{ display: 'inline-block', minWidth: 60 }}>{user.name}</span>
                </button>
                {headerOpen && (
                  <div style={{ position: 'absolute', right: 0, marginTop: 8, width: 180, borderRadius: 8, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', zIndex: 70 }}>
                    <Link to="/admin/profile" onClick={() => setHeaderOpen(false)} style={{ display: 'block', padding: '8px 12px', color: '#374151', textDecoration: 'none' }}>Profile</Link>
                    <button onClick={() => { setHeaderOpen(false); logout(); navigate('/'); }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* spacer for fixed header */}
        <div style={{ height: 64 }} />

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

