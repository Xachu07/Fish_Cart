import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{ background: '#ffffff', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/admin/dashboard" style={{ color: '#0f766e', fontSize: 18, fontWeight: 700, textDecoration: 'none' }}>
            FishCart Admin
          </Link>
          <nav style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link to="/admin/dashboard" style={{ color: '#374151', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/admin/inventory" style={{ color: '#374151', textDecoration: 'none' }}>Inventory</Link>
            <Link to="/admin/orders" style={{ color: '#374151', textDecoration: 'none' }}>Live Orders</Link>
            <Link to="/admin/packing" style={{ color: '#374151', textDecoration: 'none' }}>Packing List</Link>
            <Link to="/admin/users" style={{ color: '#374151', textDecoration: 'none' }}>Users</Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#374151', fontSize: 14 }}>{user?.name || 'Admin'}</span>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
            <LogOut style={{ width: 16, height: 16 }} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

