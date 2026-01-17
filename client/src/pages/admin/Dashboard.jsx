import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    shopStatus: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, statusRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders/admin'),
        api.get('/shop/status'),
      ]);

      const orders = ordersRes.data;
      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'Pending').length,
        shopStatus: statusRes.data.isOpen,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}!</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        <div
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Total Products</h3>
          <p style={{ fontSize: '36px', margin: '10px 0' }}>{stats.totalProducts}</p>
        </div>
        <div
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Total Orders</h3>
          <p style={{ fontSize: '36px', margin: '10px 0' }}>{stats.totalOrders}</p>
        </div>
        <div
          style={{
            backgroundColor: '#ffc107',
            color: 'black',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Pending Orders</h3>
          <p style={{ fontSize: '36px', margin: '10px 0' }}>{stats.pendingOrders}</p>
        </div>
        <div
          style={{
            backgroundColor: stats.shopStatus ? '#28a745' : '#dc3545',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Shop Status</h3>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>
            {stats.shopStatus ? 'OPEN' : 'CLOSED'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
