import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/myorders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#ffc107';
      case 'Packed':
        return '#17a2b8';
      case 'Out for Delivery':
        return '#007bff';
      case 'Delivered':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet. Start shopping to place your first order!</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                }}
              >
                <div>
                  <strong>Order ID:</strong> {order._id.slice(-8).toUpperCase()}
                </div>
                <div>
                  <span
                    style={{
                      padding: '5px 15px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontSize: '14px',
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div>
                <strong>Ordered on:</strong>{' '}
                {new Date(order.createdAt).toLocaleString()}
              </div>
              {order.assignedPartnerId && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Delivery Partner:</strong> {order.assignedPartnerId.name}
                  {order.assignedPartnerId.phone && ` - ${order.assignedPartnerId.phone}`}
                </div>
              )}
              <div style={{ marginTop: '15px' }}>
                <strong>Items:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.fishName} - {item.qty} kg ({item.preparation})
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <strong style={{ fontSize: '18px' }}>Total: ₹{order.totalAmount}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
