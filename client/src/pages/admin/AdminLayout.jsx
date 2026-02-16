import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ClipboardList, Store, Users, LogOut, Menu, X, Search, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef();
  const profileRef = useRef();

  // close dropdowns on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/admin" className="text-xl font-bold text-white tracking-wide">
            FishCart <span className="text-blue-400">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/inventory', label: 'Products', icon: Package },
            { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
            { to: '/admin/packing', label: 'Packing List', icon: ClipboardList },
            { to: '/admin/shop-status', label: 'Shop Status', icon: Store },
            { to: '/admin/users', label: 'Users', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE SIDEBAR (overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-slate-900 text-slate-300 p-4">
            <div className="h-16 flex items-center px-2 border-b border-slate-800">
              <Link to="/admin" className="text-lg font-bold text-white tracking-wide">
                FishCart <span className="text-blue-400">Admin</span>
              </Link>
              <button className="ml-auto p-2" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <nav className="mt-6 space-y-2">
              {[
                { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/admin/inventory', label: 'Products', icon: Package },
                { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
                { to: '/admin/packing', label: 'Packing List', icon: ClipboardList },
                { to: '/admin/shop-status', label: 'Shop Status', icon: Store },
                { to: '/admin/users', label: 'Users', icon: Users },
              ].map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-md hover:bg-slate-100" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="hidden md:block text-lg font-semibold text-slate-800">Dashboard</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // navigate to orders with search query
                      navigate(`/admin/orders?search=${encodeURIComponent(searchTerm.trim())}`);
                    }
                  }}
                  className="border border-slate-200 rounded-md px-3 py-2 w-56 pr-10"
                  placeholder="Search orders, customers..."
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((s) => !s)}
                  className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                    <div className="p-3 border-b text-sm font-medium">Notifications</div>
                    <div className="p-3 text-sm text-slate-700">No new notifications.</div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100"
                >
                  <User className="w-5 h-5 text-slate-700" />
                  <span className="text-sm text-slate-700 hidden sm:inline">{user.name || 'Admin'}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                    <Link to="/admin/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</Link>
                    <button onClick={() => logout()} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

