import { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      // Get all users with partner role
      const User = await api.get('/auth/me'); // We'll need a better endpoint, but for now let's just handle it manually
      // For demo purposes, we'll allow manual partner ID entry or create a partners list
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const assignToPartner = async (orderId, partnerId) => {
    if (!partnerId) {
      alert('Please enter a partner ID');
      return;
    }
    setAssigning(orderId);
    try {
      await api.put(`/orders/${orderId}/assign`, { partnerId });
      alert('Order assigned successfully');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign order');
    } finally {
      setAssigning(null);
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>All Orders</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Status: </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ padding: '8px', marginLeft: '10px' }}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Packed">Packed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <strong>Order ID:</strong> {order._id.slice(-8).toUpperCase()}
                  <br />
                  <strong>Customer:</strong> {order.userId?.name} ({order.userId?.email})
                  <br />
                  <strong>Phone:</strong> {order.userId?.phone || 'N/A'}
                  <br />
                  <strong>Address:</strong> {order.userId?.address || 'N/A'}
                </div>
                <div>
                  <span
                    style={{
                      padding: '8px 15px',
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

              <div style={{ marginBottom: '15px' }}>
                <strong>Items:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.fishName} - {item.qty} kg ({item.preparation})
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Total: ₹{order.totalAmount}</strong>
              </div>

              {order.assignedPartnerId && (
                <div style={{ marginBottom: '15px', color: '#007bff' }}>
                  <strong>Assigned Partner:</strong> {order.assignedPartnerId.name}
                  {order.assignedPartnerId.phone && ` - ${order.assignedPartnerId.phone}`}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Packed">Packed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>

                {!order.assignedPartnerId && order.status === 'Packed' && (
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Partner ID"
                      id={`partner-${order._id}`}
                      style={{ padding: '8px', width: '150px' }}
                    />
                    <button
                      onClick={() => {
                        const partnerId = document.getElementById(`partner-${order._id}`).value;
                        assignToPartner(order._id, partnerId);
                      }}
                      disabled={assigning === order._id}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {assigning === order._id ? 'Assigning...' : 'Assign Partner'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Ordered: {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
