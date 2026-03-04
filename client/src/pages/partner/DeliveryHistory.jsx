import { useState, useEffect, Fragment } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { History, Package, ChevronDown, ChevronUp } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/partner/delivery-history');
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Fetch delivery history', err);
        toast.error('Failed to load delivery history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const fetchOrdersForDate = async (dateStr) => {
    if (ordersByDate[dateStr]) {
      setExpandedDate(expandedDate === dateStr ? null : dateStr);
      return;
    }
    setExpandedDate(dateStr);
    setLoadingDetails(true);
    try {
      const res = await api.get('/orders/partner/delivery-history/orders', { params: { date: dateStr } });
      setOrdersByDate((prev) => ({ ...prev, [dateStr]: Array.isArray(res.data) ? res.data : [] }));
    } catch (err) {
      console.error('Fetch orders for date', err);
      toast.error('Failed to load delivery details');
      setExpandedDate(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleDetails = (dateStr) => {
    if (expandedDate === dateStr) setExpandedDate(null);
    else fetchOrdersForDate(dateStr);
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
        Loading delivery history…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 12px 32px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <History size={24} style={{ color: 'var(--sea-600)' }} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Delivery History</h1>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>
        All completed deliveries and cash transferred by date.
      </p>

      {history.length === 0 ? (
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 16,
            padding: 48,
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <Package size={40} style={{ marginBottom: 12, opacity: 0.6 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No delivery history yet</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Completed deliveries will appear here by date.</div>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Date
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Deliveries
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Cash transferred
                </th>
                <th style={{ padding: '14px 16px', width: 100, fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <Fragment key={row.date}>
                  <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {formatDate(row.date)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#475569' }}>
                      {row.deliveriesCount}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      ₹{Number(row.cashCollected || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => toggleDetails(row.date)}
                        disabled={loadingDetails}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--sea-600)',
                          background: 'rgba(15,118,110,0.08)',
                          border: 'none',
                          borderRadius: 8,
                          cursor: loadingDetails ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {expandedDate === row.date ? (
                          <>Hide details <ChevronUp size={14} /></>
                        ) : (
                          <>View details <ChevronDown size={14} /></>
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedDate === row.date && (
                    <tr key={`${row.date}-details`}>
                      <td colSpan={4} style={{ padding: 0, verticalAlign: 'top', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ padding: '16px 20px' }}>
                          {loadingDetails ? (
                            <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 14 }}>Loading…</div>
                          ) : (ordersByDate[row.date]?.length ?? 0) > 0 ? (
                            <>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>
                                Deliveries on {formatDate(row.date)}
                              </div>
                              <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                  <thead style={{ background: '#f1f5f9' }}>
                                    <tr>
                                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Customer</th>
                                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Address</th>
                                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Items</th>
                                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>Amount</th>
                                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Payment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {ordersByDate[row.date].map((order) => (
                                      <tr key={order._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '10px 12px', color: '#0f172a' }}>
                                          {order.userId?.name || '—'}
                                          {order.userId?.phone && (
                                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{order.userId.phone}</div>
                                          )}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#475569', maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                          {order.userId?.address || order.deliveryOverride?.address || '—'}
                                        </td>
                                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                                          {(order.items || []).map((item, i) => `${item.qty}kg ${item.fishName} (${item.preparation})`).join(', ') || '—'}
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                                          ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                          <span style={{
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: order.paymentMethod === 'PREPAID' ? '#ecfdf5' : '#fef3c7',
                                            color: order.paymentMethod === 'PREPAID' ? '#065f46' : '#92400e',
                                          }}>
                                            {order.paymentMethod === 'PREPAID' ? 'PREPAID' : 'COD'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', padding: 16, color: '#64748b', fontSize: 13 }}>No orders for this date.</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
