import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Store, Users, MapPin, Truck, LogOut, Menu, X, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef();

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

  // close dropdowns on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
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
        {/* TOP HEADER */}
        <header
          className="h-16 bg-white"
          style={{
            boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
            borderBottom: '1px solid #eef2f6',
            position: 'fixed',
            top: 0,
            left: isMobile ? 0 : (isExpanded ? expandedWidth + 24 : collapsedWidth + 24),
            right: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* left: Admin label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ minWidth: 180 }}>
                <Link to="/admin/profile" style={{ textDecoration: 'none' }}>
                  <span className="logo-text" style={{ fontWeight: 800, cursor: 'pointer', color: 'inherit' }}>Fish Cart</span>
                </Link>
              </div>
            </div>

            {/* filler to push controls to right */}
            <div style={{ flex: 1 }} />

            {/* right: search + icons (aligned to far right) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/admin/orders?search=${encodeURIComponent(searchTerm.trim())}`);
                    }
                  }}
                  className="border border-slate-200 rounded-full px-4 py-2 w-64 pr-10"
                  placeholder="Search orders, customers..."
                />
                <Search className="absolute right-4 top-2.5 w-4 h-4" style={{ color: 'var(--sea-600)' }} />
              </div>

              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((s) => !s)}
                  className="p-2 rounded-md hover:bg-slate-100 text-slate-700 relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" style={{ color: 'var(--sea-600)' }} />
                  <span style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(6px,-6px)', background: '#ef4444', color: '#fff', borderRadius: 999, padding: '2px 6px', fontSize: 11, fontWeight: 700 }}>3</span>
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                    <div className="p-3 border-b text-sm font-medium">Notifications</div>
                    <div className="p-3 text-sm text-slate-700">No new notifications.</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/admin/profile" className="text-sm text-slate-700 hidden sm:inline" style={{ textDecoration: 'none' }}>
                  Admin
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded-full bg-orange-500 px-3 py-1.5 text-white font-semibold hover:bg-orange-600"
                >
                  Logout
                </button>
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

