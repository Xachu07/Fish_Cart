import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Banknote, IndianRupee, Fish, FileText, Truck, AlertTriangle, Store, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const LOW_STOCK_THRESHOLD = 5;
const RUPEES = '\u20B9'; // ₹
const EM_DASH = '\u2014'; // —

function todayDateStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopUpdating, setShopUpdating] = useState(false);
  const [pulseDate, setPulseDate] = useState(todayDateStr());
  const [verifiedTransfersTotal, setVerifiedTransfersTotal] = useState(0);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, shopRes] = await Promise.all([
        api.get('/orders/admin'),
        api.get('/products'),
        api.get('/shop/status').catch(() => ({ data: { isOpen: false, cleaningFee: 0 } })),
      ]);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setShopOpen(!!shopRes?.data?.isOpen);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedTransfers = async () => {
    if (!pulseDate) return;
    try {
      const res = await api.get('/admin/verified-transfers', { params: { date: pulseDate } });
      setVerifiedTransfersTotal(Number(res.data?.total) || 0);
    } catch {
      setVerifiedTransfersTotal(0);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchVerifiedTransfers();
  }, [pulseDate]);

  const toggleShopStatus = async () => {
    if (shopOpen) {
      const confirmed = window.confirm('Are you sure you want to close the shop for today?');
      if (!confirmed) return;
    }
    setShopUpdating(true);
    try {
      const res = await api.put('/shop/status', { isOpen: !shopOpen });
      setShopOpen(!!res.data?.isOpen);
      toast.success(res.data?.isOpen ? 'Shop is now OPEN' : 'Shop is now CLOSED');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shop status');
    } finally {
      setShopUpdating(false);
    }
  };

  const getOrderDisplayId = (order) => order?.displayId || (order?._id ? `#${String(order._id).slice(-8)}` : EM_DASH);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const pulseDateObj = pulseDate ? new Date(pulseDate + 'T12:00:00') : null;
  const pulseOrders = pulseDateObj
    ? orders.filter((o) => isSameDay(new Date(o.createdAt), pulseDateObj) && o.status !== 'Cancelled')
    : orders.filter((o) => o.status !== 'Cancelled');
  const pulseOrderCount = pulseOrders.length;
  const pulsePendingDeliveries = pulseOrders.filter((o) => o.status !== 'Delivered').length;
  const pulseCashToCollect = pulseOrders
    .filter((o) => o.status !== 'Delivered' && o.paymentMethod === 'COD')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  // Revenue = prepaid orders for date + verified COD transfers for that date (verified in Delivery Partners)
  const pulsePrepaidRevenue = pulseOrders
    .filter((o) => o.paymentMethod === 'PREPAID')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const pulseRevenue = pulsePrepaidRevenue + verifiedTransfersTotal;


  const lowStockProducts = products.filter(
    (p) => p.isActive !== false && (Number(p.stockQuantity) <= LOW_STOCK_THRESHOLD || p.status === 'Sold Out')
  );
  const recentOrders = orders.filter((o) => o.status !== 'Cancelled').slice(0, 5);

  const cardStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };
  const sectionStyle = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>Loading…</div>
    );
  }

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Shop Status at top */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shop Status</h2>
        <div
          style={{
            ...sectionStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background: shopOpen ? '#f0fdf4' : '#fef2f2',
            borderColor: shopOpen ? '#bbf7d0' : '#fecaca',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: shopOpen ? 'rgba(34,197,94,0.2)' : 'rgba(185,28,28,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={24} style={{ color: shopOpen ? '#16a34a' : '#b91c1c' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: shopOpen ? '#166534' : '#b91c1c' }}>
                Shop is {shopOpen ? 'OPEN' : 'CLOSED'}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={toggleShopStatus}
              disabled={shopUpdating}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: shopUpdating ? 'not-allowed' : 'pointer',
                background: shopOpen ? '#dc2626' : '#16a34a',
                color: '#fff',
              }}
            >
              {shopUpdating ? 'Updating…' : shopOpen ? 'Close shop' : 'Open shop'}
            </button>
          </div>
        </div>
      </section>

      {/* 1. Dashboard - 4 cards */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dashboard</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>
            Date
            <input
              type="date"
              value={pulseDate || ''}
              onChange={(e) => setPulseDate(e.target.value || todayDateStr())}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' }}
            />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Orders</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{pulseOrderCount}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={20} style={{ color: 'var(--sea-600)' }} />
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Pending Deliveries</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{pulsePendingDeliveries}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} style={{ color: '#b45309' }} />
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Cash to Collect</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{RUPEES}{pulseCashToCollect.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Banknote size={20} style={{ color: '#16a34a' }} />
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Revenue</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{RUPEES}{pulseRevenue.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IndianRupee size={20} style={{ color: 'var(--sea-600)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Action Buttons */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link
            to="/admin/products"
            style={{
              flex: '1 1 200px',
              ...sectionStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              minHeight: 72,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fish size={24} style={{ color: 'var(--sea-600)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Update Daily Catch</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Change fish prices and stock</div>
            </div>
          </Link>
          <Link
            to="/admin/packing"
            style={{
              flex: '1 1 200px',
              ...sectionStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              minHeight: 72,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} style={{ color: 'var(--sea-600)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Print Packing List</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Generate cutting list for kitchen</div>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            style={{
              flex: '1 1 200px',
              ...sectionStyle,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              textDecoration: 'none',
              color: '#0f172a',
              cursor: 'pointer',
              minHeight: 72,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} style={{ color: 'var(--sea-600)' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Assign Drivers</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Driver routing and orders</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Low Stock Alerts + 4. Recent Orders - side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* Low Stock Alerts */}
        <section style={sectionStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} style={{ color: '#b45309' }} />
            Low Stock Alerts
          </h2>
          {lowStockProducts.length === 0 ? (
            <p style={{ fontSize: 14, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
              All items are sufficiently stocked!
            </p>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {lowStockProducts.map((p) => (
                <li
                  key={p._id}
                  style={{
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 14,
                    color: p.status === 'Sold Out' ? '#b91c1c' : '#0f172a',
                  }}
                >
                  {p.fishName}
                  {p.status === 'Sold Out' ? (
                    <span style={{ fontWeight: 600, marginLeft: 6 }}>{EM_DASH} Out of Stock</span>
                  ) : (
                    <span style={{ color: '#b45309', marginLeft: 6 }}>{EM_DASH} Only {p.stockQuantity} kg left</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Orders - mini table */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: 13, fontWeight: 600, color: 'var(--sea-600)', textDecoration: 'none' }}>View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ fontSize: 14, color: '#64748b' }}>No orders yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '36%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '18%' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '8px 6px 8px 0', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Order</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Customer</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Items</th>
                    <th style={{ padding: '8px 0 8px 6px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>Amount</th>
                    <th style={{ padding: '8px 0 8px 6px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 6px 10px 0', color: '#0f172a', fontFamily: 'monospace', fontSize: 12 }}>{getOrderDisplayId(o)}</td>
                      <td style={{ padding: '10px 6px', color: '#0f172a' }}>{o.userId?.name || EM_DASH}</td>
                      <td style={{ padding: '10px 6px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(o.items || []).map((i) => `${i.fishName} (${i.qty}kg)`).join(', ')}
                      </td>
                      <td style={{ padding: '10px 0 10px 6px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{RUPEES}{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 0 10px 6px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'Out for Delivery' ? '#dbeafe' : '#fef3c7',
                            color: o.status === 'Delivered' ? '#166534' : o.status === 'Out for Delivery' ? '#1e40af' : '#92400e',
                          }}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
