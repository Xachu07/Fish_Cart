import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <div>
        <Link
          to="/"
          style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}
        >
          Fish Cart
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Home
            </Link>
            <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>
              Cart ({cart.length})
            </Link>
            <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>
              My Orders
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
                Admin
              </Link>
            )}
            {user.role === 'partner' && (
              <Link to="/partner" style={{ color: 'white', textDecoration: 'none' }}>
                Partner
              </Link>
            )}
            <span>Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '5px 15px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
