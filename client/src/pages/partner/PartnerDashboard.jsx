import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      const res = await api.get('/orders/assigned');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert(`Order status updated to ${newStatus}`);
      fetchAssignedOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status');
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

  const filteredOrders =
    filterStatus === 'All'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '15px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h2>My Deliveries</h2>
        <p>Welcome, {user?.name}!</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px',
          }}
        >
          <option value="All">All</option>
          <option value="Packed">Packed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            color: '#666',
          }}
        >
          <p style={{ fontSize: '18px' }}>No {filterStatus.toLowerCase()} deliveries assigned.</p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              style={{
                border: '2px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    Order ID
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                    {order._id.slice(-8).toUpperCase()}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      padding: '8px 15px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                  Customer Details
                </div>
                <div style={{ lineHeight: '1.8' }}>
                  <div>
                    <strong>Name:</strong> {order.userId?.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Phone:</strong>{' '}
                    <a
                      href={`tel:${order.userId?.phone}`}
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      {order.userId?.phone || 'N/A'}
                    </a>
                  </div>
                  <div>
                    <strong>Address:</strong> {order.userId?.address || 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
                  Items to Deliver:
                </div>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  {order.items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      {item.fishName} - {item.qty} kg ({item.preparation})
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  borderTop: '2px solid #ddd',
                  paddingTop: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Total: ₹{order.totalAmount}
                </div>

                {order.status !== 'Delivered' && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {order.status === 'Packed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }}
                      >
                        Start Delivery
                      </button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              'Confirm that you have delivered this order and collected payment?'
                            )
                          ) {
                            updateOrderStatus(order._id, 'Delivered');
                          }
                        }}
                        style={{
                          padding: '12px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 'bold',
                        }}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: '15px',
                  fontSize: '12px',
                  color: '#666',
                  fontStyle: 'italic',
                }}
              >
                Assigned: {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#004085',
          }}
        >
          <strong>
            Total Orders: {filteredOrders.length} ({filteredOrders.filter((o) => o.status !== 'Delivered').length} pending)
          </strong>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;
