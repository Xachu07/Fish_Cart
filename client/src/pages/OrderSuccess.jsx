import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId || location.state?.order?._id;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <CheckCircle size={64} style={{ color: '#16a34a' }} />
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
        Order placed successfully
      </h1>
      <p style={{ fontSize: 16, color: '#475569', marginBottom: 8 }}>
        Your catch will be procured fresh and delivered tomorrow morning.
      </p>
      {orderId && (
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
          Order ID: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{String(orderId).slice(-8).toUpperCase()}</strong>
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link
          to="/orders"
          style={{
            display: 'block',
            padding: 14,
            background: 'var(--sea-600)',
            color: '#fff',
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          View my orders
        </Link>
        <Link
          to="/daily-catch"
          style={{
            display: 'block',
            padding: 14,
            border: '2px solid var(--sea-600)',
            color: 'var(--sea-600)',
            borderRadius: 12,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
