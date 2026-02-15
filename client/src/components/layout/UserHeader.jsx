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
    <header style={{ background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ color: '#0f766e', fontSize: 20, fontWeight: 700, textDecoration: 'none' }}>
            Fish Cart
          </Link>
          <nav style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link to="/" style={{ color: '#374151', textDecoration: 'none' }}>Home</Link>
            <a href="#daily-catch" style={{ color: '#374151', textDecoration: 'none' }}>Daily Catch</a>
            <a href="#about" style={{ color: '#374151', textDecoration: 'none' }}>About</a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <Link to="/orders" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>My Orders</Link>

              <Link to="/cart" aria-label="Cart" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', background: '#f97316', color: '#fff', padding: '8px 10px', borderRadius: 24, textDecoration: 'none' }}>
                <ShoppingBag style={{ width: 16, height: 16 }} />
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', right: -8, top: -8, minWidth: 20, height: 20, background: '#fff', color: '#f97316', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {cart.length}
                  </span>
                )}
              </Link>

              <div style={{ position: 'relative' }}>
                <button onClick={() => setOpen((s) => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 20, border: '1px solid #e5e7eb', padding: '6px 10px', background: '#fff' }}>
                  <User style={{ width: 16, height: 16 }} />
                  <span style={{ display: 'inline-block', minWidth: 60 }}>{user.name}</span>
                </button>
                {open && (
                  <div style={{ position: 'absolute', right: 0, marginTop: 8, width: 180, borderRadius: 8, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <Link to="/orders" onClick={() => setOpen(false)} style={{ display: 'block', padding: '8px 12px', color: '#374151', textDecoration: 'none' }}>My Orders</Link>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '8px 12px', color: '#374151', textDecoration: 'none', borderRadius: 6 }}>Login</Link>
              <Link to="/register" style={{ padding: '8px 12px', background: '#0f766e', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default UserHeader;

