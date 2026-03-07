import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const DATE_FILTERS = [
  { value: 'all', label: 'All time' },
  { value: '7', label: 'Last 7 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
];

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

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

  const getOrderDisplayId = (order) => {
    if (order.displayId) return order.displayId;
    return '#' + (order._id ? String(order._id).slice(-8).toUpperCase() : '');
  };

  const orderMatchesSearch = (order, term) => {
    if (!term || !term.trim()) return true;
    const t = term.trim().toLowerCase();
    const displayId = getOrderDisplayId(order);
    if (displayId.toLowerCase().replace('#', '').includes(t)) return true;
    if (order.items && order.items.some((item) => (item.fishName || '').toLowerCase().includes(t))) return true;
    return false;
  };

  const orderMatchesDate = (order, filter) => {
    if (!filter || filter === 'all') return true;
    const d = new Date(order.createdAt);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filter === '7') {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 7);
      return d >= from && d <= now;
    }
    if (filter === '30') {
      const from = new Date(todayStart);
      from.setDate(from.getDate() - 30);
      return d >= from && d <= now;
    }
    if (filter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return d >= monthStart && d <= now;
    }
    return true;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => orderMatchesSearch(order, searchTerm) && orderMatchesDate(order, dateFilter));
  }, [orders, searchTerm, dateFilter]);

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
      case 'Cancelled':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      console.error('Cancel order error', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const formatOrderDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getPaymentLabel = (order) => order.paymentMethod === 'PREPAID' ? 'Prepaid' : 'COD';

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20 }}>My Orders</h2>

      {orders.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flex: '1 1 240px',
              minWidth: 0,
              maxWidth: 360,
              padding: '10px 14px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
            }}
          >
            <Search size={20} style={{ color: '#64748b', flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID or fish name..."
              style={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                fontSize: 14,
                background: 'transparent',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="orders-date-filter" style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>Filter by date:</label>
            <select
              id="orders-date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #e5e7eb',
                background: '#fff',
                fontSize: 14,
                fontWeight: 500,
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {DATE_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <p>No orders yet. Start shopping to place your first order!</p>
      ) : filteredOrders.length === 0 ? (
        <p style={{ color: '#64748b' }}>No orders match your search or date filter.</p>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <strong>Order ID:</strong> {getOrderDisplayId(order)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {order.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order._id)}
                      style={{
                        padding: '6px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#b91c1c',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel order
                    </button>
                  )}
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
                {formatOrderDate(order.createdAt)}
              </div>
              {(order.status === 'Out for Delivery' || order.status === 'Delivered') && order.assignedPartnerId && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Assigned Driver:</strong> {order.assignedPartnerId.name}
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
                {order.status === 'Cancelled' ? (
                  order.paymentMethod === 'PREPAID' ? (
                    <strong style={{ fontSize: '18px' }}>Total: ₹{order.totalAmount} (Refunded)</strong>
                  ) : (
                    <strong style={{ fontSize: '18px', color: '#64748b' }}>Order cancelled (COD – no amount charged)</strong>
                  )
                ) : (
                  <strong style={{ fontSize: '18px' }}>Total: ₹{order.totalAmount} ({getPaymentLabel(order)})</strong>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
