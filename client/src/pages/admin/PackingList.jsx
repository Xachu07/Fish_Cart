import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Printer } from 'lucide-react';

const PREP_COLUMNS = ['Whole', 'Cleaned', 'Curry Piece', 'Fry Cut'];

export default function PackingList() {
  const [orders, setOrders] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [packingProductName, setPackingProductName] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchAreas();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching orders', err);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching areas', err);
    }
  };

  const getOrderArea = (order) => order.userId?.areaOfService?.name || null;

  const ordersInArea = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'Delivered') return false;
      if (!selectedArea) return true;
      return getOrderArea(o) === selectedArea;
    });
  }, [orders, selectedArea]);

  const aggregatedTable = useMemo(() => {
    const byFish = {};
    ordersInArea.forEach((order) => {
      (order.items || []).forEach((item) => {
        const fishName = item.fishName || 'Unknown';
        if (!byFish[fishName]) {
          byFish[fishName] = { Whole: 0, Cleaned: 0, 'Curry Piece': 0, 'Fry Cut': 0 };
        }
        const prep = item.preparation === 'Cleaned' ? 'Cleaned' : 'Whole';
        if (byFish[fishName][prep] !== undefined) byFish[fishName][prep] += Number(item.qty) || 0;
      });
    });
    return Object.entries(byFish).map(([productName, preps]) => {
      const total = PREP_COLUMNS.reduce((sum, col) => sum + (preps[col] || 0), 0);
      return { productName, ...preps, total };
    }).sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
  }, [ordersInArea]);

  const orderIdsWithProduct = (productName) =>
    ordersInArea
      .filter((o) => (o.items || []).some((i) => i.fishName === productName))
      .map((o) => o._id);

  const isRowPacked = (productName) => {
    const ids = orderIdsWithProduct(productName);
    if (ids.length === 0) return true;
    return ids.every((id) => {
      const order = ordersInArea.find((o) => o._id === id);
      return order && order.status !== 'Pending';
    });
  };

  const markProductPacked = async (productName) => {
    const ids = orderIdsWithProduct(productName);
    if (ids.length === 0) return;
    setPackingProductName(productName);
    try {
      await Promise.all(ids.map((id) => api.put(`/orders/${id}/status`, { status: 'Packed' })));
      toast.success('Orders marked as packed');
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update orders');
    } finally {
      setPackingProductName(null);
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
  };

  return (
    <div className="packing-list-print" style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 24 }}>Packing List</h1>
          {/* Area filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Area of Service
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                minWidth: 220,
                background: '#fff',
              }}
            >
              <option value="">All Areas</option>
              {areas.map((a) => (
                <option key={a._id} value={a.name}>{a.name}</option>
              ))}
            </select>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              {selectedArea ? (
                <>Orders for <strong>{selectedArea}</strong> (Pending / Packed / Out for Delivery): {ordersInArea.length}</>
              ) : (
                <>Orders in <strong>All Areas</strong> (Pending / Packed / Out for Delivery): {ordersInArea.length}</>
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            background: '#f9fafb',
            color: '#374151',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          <Printer size={18} /> Print List
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading…</div>
      ) : ordersInArea.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 12, color: '#64748b' }}>
          {selectedArea ? 'No orders to pack for this area.' : 'No orders to pack.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '18%' }}>Product Name</th>
                {PREP_COLUMNS.map((col) => (
                  <th key={col} style={{ ...thStyle, width: '12%', textAlign: 'right' }}>{col}</th>
                ))}
                <th style={{ ...thStyle, width: '14%', textAlign: 'right' }}>Total Required</th>
                <th style={{ ...thStyle, width: '140px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedTable.map((row) => {
                const isPacked = isRowPacked(row.productName);
                const rowBg = isPacked ? '#f0fdf4' : undefined;
                const rowColor = isPacked ? '#166534' : '#0f172a';
                const rowOpacity = isPacked ? 0.85 : 1;
                const isPacking = packingProductName === row.productName;
                return (
                  <tr key={row.productName} style={{ background: rowBg }}>
                    <td style={{ ...tdStyle, fontWeight: 600, color: rowColor, opacity: rowOpacity }}>{row.productName}</td>
                    {PREP_COLUMNS.map((col) => (
                      <td key={col} style={{ ...tdStyle, textAlign: 'right', color: rowColor, opacity: rowOpacity }}>
                        {row[col] ? `${row[col]} kg` : '—'}
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: rowColor, opacity: rowOpacity }}>
                      {row.total} kg
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {isPacked ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: '#16a34a',
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          Packed ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markProductPacked(row.productName)}
                          disabled={isPacking}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #16a34a',
                            borderRadius: 8,
                            background: 'transparent',
                            color: '#16a34a',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: isPacking ? 'wait' : 'pointer',
                          }}
                        >
                          {isPacking ? 'Updating…' : 'Mark Packed'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
