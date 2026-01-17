import { Link, useLocation } from 'react-router-dom';

const AdminNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navStyle = (path) => ({
    padding: '10px 20px',
    textDecoration: 'none',
    color: isActive(path) ? '#007bff' : '#333',
    backgroundColor: isActive(path) ? '#e7f3ff' : 'transparent',
    borderRadius: '4px',
    display: 'inline-block',
    marginRight: '10px',
  });

  return (
    <nav
      style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px',
      }}
    >
      <Link to="/admin" style={navStyle('/admin')}>
        Dashboard
      </Link>
      <Link to="/admin/products" style={navStyle('/admin/products')}>
        Products
      </Link>
      <Link to="/admin/orders" style={navStyle('/admin/orders')}>
        Orders
      </Link>
      <Link to="/admin/packing" style={navStyle('/admin/packing')}>
        Packing List
      </Link>
      <Link to="/admin/shop-status" style={navStyle('/admin/shop-status')}>
        Shop Status
      </Link>
    </nav>
  );
};

export default AdminNav;
