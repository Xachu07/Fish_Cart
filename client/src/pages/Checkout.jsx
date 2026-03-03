import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [delivery, setDelivery] = useState({ name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [meRes, shopRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/shop/status').catch(() => ({ data: { isOpen: false } })),
        ]);
        const u = meRes.data?.user;
        if (u) setProfile(u);
        setShopOpen(!!shopRes.data?.isOpen);

        setDelivery({
          name: u?.name || '',
          phone: u?.phone || '',
          address: u?.address || '',
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const deliveryFee = Number(profile?.areaOfService?.deliveryFee ?? 0);
  const subtotal = getTotal();
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!delivery.name?.trim()) {
      toast.error('Please enter delivery name');
      return;
    }
    if (!delivery.phone?.trim()) {
      toast.error('Please enter a valid mobile number');
      return;
    }
    if (!delivery.address?.trim()) {
      toast.error('Please enter delivery address');
      return;
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!shopOpen) {
      toast.error('Shop is currently closed. Ordering is not available.');
      return;
    }

    setPlacing(true);
    try {
      const items = cart.map((item) => ({
        fishName: item.fishName,
        qty: item.qty,
        preparation: item.preparation,
      }));

      const body = {
        items,
        paymentMethod: paymentMethod === 'UPI' ? 'PREPAID' : 'COD',
      };

      const res = await api.post('/orders', body);
      clearCart();
      toast.success('Order placed successfully');
      navigate('/order-success', { state: { orderId: res.data._id, order: res.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        Loading…
      </div>
    );
  }

  if (cart.length === 0 && !loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 16 }}>Your cart is empty.</p>
        <Link to="/daily-catch" style={{ color: 'var(--sea-600)', fontWeight: 600 }}>Continue shopping</Link>
      </div>
    );
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e5e7eb',
    padding: 20,
    marginBottom: 20,
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Checkout</h1>

      {/* 1. Delivery Information (view only; edit in Profile) */}
      <section style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Delivery information</h2>
          <Link to="/profile" style={{ fontSize: 13, fontWeight: 600, color: 'var(--sea-600)', textDecoration: 'none' }}>Edit in Profile</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc', borderRadius: 8, padding: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Full name</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{delivery.name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Mobile Number</div>
            <div style={{ fontSize: 14, color: '#0f172a' }}>{delivery.phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>House address</div>
            <div style={{ fontSize: 14, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{delivery.address || '—'}</div>
          </div>
        </div>
      </section>

      {/* 2. Order Summary & Fees */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Order summary</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 12 }}>
          {cart.map((item, i) => (
            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 14 }}>
              <span>
                {item.qty} kg {item.fishName} ({item.preparation})
              </span>
              <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', marginBottom: 6 }}>
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', marginBottom: 12 }}>
          <span>Delivery fee</span>
          <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#0f172a', paddingTop: 12, borderTop: '2px solid #e5e7eb' }}>
          <span>Grand total</span>
          <span>₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </section>

      {/* 3. Delivery Schedule Reminder */}
      <section style={{ ...cardStyle, background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.5 }}>
          🚚 Delivery scheduled for: <strong>Tomorrow morning.</strong>
        </p>
      </section>

      {/* 4. Payment Methods */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Payment</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', cursor: 'pointer' }}>
          <input type="radio" name="pay" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
          <span style={{ fontWeight: 600 }}>Cash on Delivery (COD)</span>
        </label>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginLeft: 28 }}>Pay when you receive your order.</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', cursor: 'pointer', marginTop: 12 }}>
          <input type="radio" name="pay" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
          <span style={{ fontWeight: 600 }}>Prepay – Scan QR (demo)</span>
        </label>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', marginLeft: 28 }}>Scan the QR with your phone. For this project, payment is simulated.</p>

        {paymentMethod === 'UPI' && (
          <div style={{ marginTop: 20, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Scan to pay ₹{grandTotal.toLocaleString('en-IN')}</p>
            <div style={{ display: 'inline-block', padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <QRCodeSVG
                value={`FISHCART-PREPAY|Amount:₹${grandTotal}|Order total (demo - no real payment)`}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b', maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
              Use your phone camera or any QR scanner to scan. In this project, no real payment is made — click &quot;I&apos;ve paid – Place order&quot; below to mark as prepaid and place the order.
            </p>
          </div>
        )}
      </section>

      {/* 5. Place Order */}
      {!shopOpen && (
        <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 12 }}>Shop is currently closed. Orders accepted 5:00 PM – 12:00 AM.</p>
      )}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={placing || !shopOpen}
        style={{
          width: '100%',
          padding: 16,
          background: placing || !shopOpen ? '#94a3b8' : 'var(--sea-600)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 700,
          cursor: placing || !shopOpen ? 'not-allowed' : 'pointer',
        }}
      >
        {placing
          ? 'Placing order…'
          : paymentMethod === 'UPI'
            ? "I've paid – Place order"
            : 'Place order'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 12 }}>
        <Link to="/cart" style={{ fontSize: 14, color: 'var(--sea-600)' }}>← Back to cart</Link>
      </p>
    </div>
  );
}
