import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [areas, setAreas] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterArea, setFilterArea] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filterDate) {
        params.dateFrom = filterDate;
        params.dateTo = filterDate;
      }
      const res = await api.get('/orders/admin', { params });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch orders error', err);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [filterDate]);

  useEffect(() => {
    fetchAreas();
    fetchPartners();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch areas error', err);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await api.get('/admin/partners/overview');
      setPartners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch partners error', err);
    }
  };

  const getOrderDeliveryArea = (order) => {
    return order.userId?.areaOfService?.name || null;
  };

  const getOrderCustomer = (order) => {
    const o = order.deliveryOverride;
    const u = order.userId;
    return {
      name: (o?.name || u?.name) || '—',
      phone: (o?.phone || u?.phone) || '—',
      address: (o?.address || u?.address) || '—',
    };
  };

  const formatOrderDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getOrderDisplayId = (order) => order.displayId || '#' + String(order._id || '').slice(-6).toUpperCase();

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'All' && o.status !== filterStatus) return false;
    if (filterArea) {
      const areaName = getOrderDeliveryArea(o);
      if (!areaName || areaName !== filterArea) return false;
    }
    return true;
  });

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status updated');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePartnerChange = async (orderId, partnerId) => {
    if (!partnerId) return;
    setAssigningId(orderId);
    try {
      await api.put('/admin/assign-partner', { orderId, partnerId });
      toast.success('Partner assigned');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign partner');
    } finally {
      setAssigningId(null);
    }
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  };
  const thStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
  };
  const tdStyle = {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    color: '#0f172a',
    verticalAlign: 'top',
  };
  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    background: '#fff',
    minWidth: 140,
    cursor: 'pointer',
  };

  const getStatusSelectStyle = (status) => {
    const base = { ...selectStyle };
    if (status === 'Pending') {
      base.background = '#fef3c7';
      base.color = '#92400e';
      base.borderColor = '#fcd34d';
    } else if (status === 'Delivered') {
      base.background = '#dcfce7';
      base.color = '#166534';
      base.borderColor = '#86efac';
    } else if (status === 'Cancelled') {
      base.background = '#f1f5f9';
      base.color = '#475569';
      base.borderColor = '#cbd5e1';
    }
    return base;
  };

  const clearFilters = () => {
    setFilterArea('');
    setFilterStatus('All');
    setFilterDate('');
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1280, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Orders</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Filter by Area</label>
          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              minWidth: 180,
              background: '#fff',
            }}
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a._id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              minWidth: 180,
              background: '#fff',
            }}
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              background: '#fff',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              background: '#fff',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '120px' }}>Order ID & Date</th>
              <th style={{ ...thStyle, minWidth: 200 }}>Customer Info</th>
              <th style={{ ...thStyle, minWidth: 220 }}>Order Items & Prep</th>
              <th style={{ ...thStyle, width: '120px' }}>Total Amount</th>
              <th style={{ ...thStyle, width: '180px' }}>Delivery Partner</th>
              <th style={{ ...thStyle, width: '180px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>Loading...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const customer = getOrderCustomer(order);
                const paymentLabel = order.paymentMethod === 'PREPAID' ? 'PREPAID' : 'COD';
                return (
                  <tr key={order._id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{getOrderDisplayId(order)}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {formatOrderDate(order.createdAt)}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{customer.name}</div>
                      <div style={{ marginTop: 4 }}>{customer.phone}</div>
                      <div style={{ fontSize: 13, color: '#475569', marginTop: 4, whiteSpace: 'pre-wrap' }}>{customer.address}</div>
                    </td>
                    <td style={tdStyle}>
                      {(order.items || []).map((item, i) => (
                        <div key={i} style={{ marginBottom: i < order.items.length - 1 ? 6 : 0 }}>
                          {item.qty}kg {item.fishName} – {item.preparation}
                        </div>
                      ))}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 999, background: '#f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 500 }}>{paymentLabel}</span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={order.assignedPartnerId?._id ?? ''}
                        onChange={(e) => handlePartnerChange(order._id, e.target.value || null)}
                        disabled={assigningId === order._id}
                        style={{ ...selectStyle, cursor: assigningId === order._id ? 'wait' : 'pointer' }}
                      >
                        <option value="">Unassigned</option>
                        {partners.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id || order.status === 'Cancelled'}
                        style={{ ...getStatusSelectStyle(order.status), cursor: updatingId === order._id || order.status === 'Cancelled' ? 'not-allowed' : 'pointer' }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
