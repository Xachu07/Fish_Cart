import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Phone, MapPin, Package, AlertCircle } from 'lucide-react';

const STATUS_PRIORITY = { 'Out for Delivery': 0, Packed: 1, Pending: 2, Delivered: 3 };

function sortPendingFirst(orders) {
  return [...orders].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 4;
    const pb = STATUS_PRIORITY[b.status] ?? 4;
    if (pa !== pb) return pa - pb;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [reportingOrderId, setReportingOrderId] = useState(null);

  const fetchAssignedOrders = async () => {
    try {
      const res = await api.get('/orders/assigned');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch assigned orders', err);
      toast.error('Failed to load deliveries');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const sortedOrders = useMemo(() => sortPendingFirst(orders), [orders]);
  const pendingOrders = useMemo(() => sortedOrders.filter((o) => o.status !== 'Delivered'), [sortedOrders]);
  const nextDelivery = pendingOrders[0] ?? null;
  const restPending = pendingOrders.slice(1);
  const allDelivered = orders.length > 0 && orders.every((o) => o.status === 'Delivered');

  const totalDeliveries = orders.length;
  const cashToCollect = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Delivered' && (o.paymentMethod !== 'PREPAID'))
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [orders]
  );
  const cashToSettle = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'Delivered' && (o.paymentMethod !== 'PREPAID'))
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [orders]
  );

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus === 'Delivered' ? 'marked delivered' : 'updated'}`);
      await fetchAssignedOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const reportIssue = async (orderId, issue) => {
    try {
      await api.put(`/orders/${orderId}/issue`, { issue });
      setReportingOrderId(null);
      toast.success('Issue reported');
      await fetchAssignedOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report issue');
    }
  };

  const openMaps = (address) => {
    const q = encodeURIComponent([address].filter(Boolean).join(', '));
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
        Loading your route…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 12px 32px', minHeight: '80vh' }}>
      {/* 1. Shift Header */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f766e 0%, #0d5c56 100%)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.95 }}>Shift</span>
          <button
            type="button"
            role="switch"
            aria-checked={online}
            onClick={() => setOnline((o) => !o)}
            style={{
              width: 56,
              height: 32,
              borderRadius: 16,
              border: 'none',
              background: online ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 4,
                left: online ? 28 : 4,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 12 }}>
          {online ? 'Ready for deliveries' : 'Offline'}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{totalDeliveries}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Total Deliveries</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>₹{cashToCollect.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Cash to Collect (COD)</div>
          </div>
        </div>
      </section>

      {/* 2. Active Route – Next Delivery */}
      {nextDelivery ? (
        <section
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div style={{ padding: '12px 16px', background: '#0f766e', color: '#fff', fontSize: 13, fontWeight: 700 }}>
            Next delivery
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                {nextDelivery.userId?.name || 'Customer'}
              </div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.4 }}>
                {nextDelivery.userId?.address || 'No address'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <a
                href={`tel:${nextDelivery.userId?.phone || ''}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px 16px',
                  background: '#0f766e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <Phone size={20} /> Call Customer
              </a>
              <button
                type="button"
                onClick={() => openMaps(nextDelivery.userId?.address)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px 16px',
                  background: '#fff',
                  color: '#0f766e',
                  border: '2px solid #0f766e',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <MapPin size={20} /> Open in Maps
              </button>
            </div>

            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Order</div>
              {(nextDelivery.items || []).map((item, i) => (
                <div key={i} style={{ fontSize: 14, color: '#0f172a' }}>
                  {item.qty}kg {item.fishName} ({item.preparation})
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              {nextDelivery.paymentMethod === 'PREPAID' ? (
                <span
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#ecfdf5',
                    color: '#065f46',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  PREPAID
                </span>
              ) : (
                <span
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#fef3c7',
                    color: '#92400e',
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  COLLECT ₹{Number(nextDelivery.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {nextDelivery.status === 'Packed' && (
              <button
                type="button"
                onClick={() => updateOrderStatus(nextDelivery._id, 'Out for Delivery')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Start delivery
              </button>
            )}
            {nextDelivery.status === 'Out for Delivery' && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Confirm delivered and payment collected (if COD)?')) {
                    updateOrderStatus(nextDelivery._id, 'Delivered');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </section>
      ) : (
        !allDelivered && totalDeliveries === 0 && (
          <section
            style={{
              background: '#f8fafc',
              borderRadius: 16,
              padding: 32,
              textAlign: 'center',
              color: '#64748b',
              marginBottom: 20,
            }}
          >
            <Package size={40} style={{ marginBottom: 12, opacity: 0.6 }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>No deliveries assigned</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Your run sheet will appear here when admin assigns orders.</div>
          </section>
        )
      )}

      {/* 3. Pending Delivery List */}
      {restPending.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Remaining ({restPending.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {restPending.map((order) => (
              <div
                key={order._id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 14,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
                      {order.userId?.name || 'Customer'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {order.userId?.areaOfService?.name || '—'}
                      {order.paymentMethod === 'PREPAID' ? ' · PREPAID' : ` · ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: order.paymentMethod === 'PREPAID' ? '#ecfdf5' : '#fef3c7',
                        color: order.paymentMethod === 'PREPAID' ? '#065f46' : '#92400e',
                      }}
                    >
                      {order.paymentMethod === 'PREPAID' ? 'PREPAID' : 'COD'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReportingOrderId(reportingOrderId === order._id ? null : order._id)}
                      style={{
                        padding: 6,
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Report issue"
                    >
                      <AlertCircle size={18} color="#64748b" />
                    </button>
                  </div>
                </div>
                {reportingOrderId === order._id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Report issue</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Customer Not Home', 'Gate Locked', 'Wrong Address', 'Other'].map((issue) => (
                        <button
                          key={issue}
                          type="button"
                          onClick={() => reportIssue(order._id, issue)}
                          style={{
                            padding: '8px 12px',
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          {issue}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. End of Shift – Settle Cash */}
      {allDelivered && totalDeliveries > 0 && (
        <section
          style={{
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            borderRadius: 16,
            padding: 24,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>All deliveries done</div>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>
            Hand over the collected cash to head office.
          </div>
          <div
            style={{
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 12,
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            ₹{cashToSettle.toLocaleString('en-IN')} to hand over
          </div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Settle Cash</div>
        </section>
      )}

      {/* Delivered list summary when there are some delivered and some pending */}
      {orders.some((o) => o.status === 'Delivered') && !allDelivered && (
        <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 10, fontSize: 13, color: '#166534' }}>
          {orders.filter((o) => o.status === 'Delivered').length} of {totalDeliveries} delivered
        </div>
      )}
    </div>
  );
}
