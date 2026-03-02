import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

const UserHeader = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ background: '#ffffff', borderBottom: '2px solid #e6f6f3' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Poppins, Inter, system-ui, sans-serif', fontWeight: 800, color: 'var(--sea-600)', fontSize: 18 }}>Fish Cart</span>
          </Link>
        </div>

        <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Link to="/" style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(15,118,110,0.06)', color: 'var(--sea-600)', textDecoration: 'none', fontSize: 14 }}>Home</Link>
          <Link to="/about" style={{ color: '#0f172a', textDecoration: 'none', fontSize: 14 }}>About Us</Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <Link to="/orders" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>My Orders</Link>

              <Link to="/cart" aria-label="Cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '6px 8px', border: '1px solid #dbe7e4', background: '#fff', textDecoration: 'none' }}>
                <ShoppingBag style={{ width: 16, height: 16, color: 'var(--sea-600)' }} />
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', right: -8, top: -8, minWidth: 20, height: 20, background: '#f97316', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {cart.length}
                  </span>
                )}
              </Link>

              <div style={{ position: 'relative' }}>
                <button onClick={() => setOpen(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 20, border: '1px solid #e5e7eb', padding: '6px 10px', background: '#fff', cursor: 'pointer' }}>
                  <User style={{ width: 16, height: 16 }} />
                  <span style={{ display: 'inline-block', minWidth: 60 }}>{user.name}</span>
                </button>
                {open && (
                  <div style={{ position: 'absolute', right: 0, marginTop: 8, width: 180, borderRadius: 8, background: '#fff', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
                    <Link to="/profile" onClick={() => setOpen(false)} style={{ display: 'block', padding: '8px 12px', color: '#374151', textDecoration: 'none' }}>Profile</Link>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '8px 12px', color: '#374151', textDecoration: 'none', borderRadius: 6, border: '1px solid #cfe7e3' }}>Login</Link>
              <Link to="/register" style={{ padding: '8px 12px', background: '#ff7a33', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;

