import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { History, Package } from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DeliveryHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
        All completed deliveries and total cash collected (COD) by date.
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
                  Cash collected (COD)
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.date} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                    {formatDate(row.date)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: '#475569' }}>
                    {row.deliveriesCount}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                    ₹{Number(row.cashCollected || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
