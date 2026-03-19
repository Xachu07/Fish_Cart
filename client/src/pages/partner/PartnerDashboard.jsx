import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Package, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';

// Backend returns orders sorted by runOrder; we use that order for the list

function OrderListItem({
  order,
  index,
  total,
  moveUp,
  moveDown,
  reordering,
  expandedOrderId,
  setExpandedOrderId,
}) {
  const isExpanded = expandedOrderId === order._id;
  const cardStyle = {
    background: '#fff',
    borderRadius: 12,
    padding: 14,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', minWidth: 24 }}>{index + 1}</span>
        <button
          type="button"
          onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flex: 1,
            minWidth: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: 4,
          }}
        >
          <ChevronRight
            size={18}
            style={{ color: '#64748b', transform: isExpanded ? 'rotate(90deg)' : 'none', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>
              {order.userId?.name || 'Customer'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {order.userId?.areaOfService?.name || '—'}
              {order.paymentMethod === 'PREPAID' ? ' · PREPAID' : ` · ₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`}
            </div>
          </div>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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
            onClick={() => moveUp(index)}
            disabled={reordering || index === 0}
            style={{
              padding: 6,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              background: '#fff',
              cursor: reordering || index === 0 ? 'not-allowed' : 'pointer',
              opacity: index === 0 ? 0.5 : 1,
            }}
            title="Move earlier"
          >
            <ChevronUp size={18} color="#475569" />
          </button>
          <button
            type="button"
            onClick={() => moveDown(index)}
            disabled={reordering || index === total - 1}
            style={{
              padding: 6,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              background: '#fff',
              cursor: reordering || index === total - 1 ? 'not-allowed' : 'pointer',
              opacity: index === total - 1 ? 0.5 : 1,
            }}
            title="Move later"
          >
            <ChevronDown size={18} color="#475569" />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
            <strong>Address:</strong> {order.userId?.address || '—'}
          </div>
          {order.userId?.phone && (
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
              <strong>Contact:</strong> {order.userId.phone}
            </div>
          )}
          <div style={{ fontSize: 13, color: '#475569' }}>
            <strong>Items:</strong>{' '}
            {(order.items || []).map((item, i) => `${item.qty}kg ${item.fishName} (${item.preparation})`).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [cashTransfer, setCashTransfer] = useState(null);
  const [markingTransferred, setMarkingTransferred] = useState(false);

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

  function todayDateStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  const isSameLocalDay = (a, b) => {
    if (!a || !b) return false;
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  };

  const fetchCashTransfer = async () => {
    try {
      const res = await api.get('/orders/partner/cash-transfer', { params: { date: todayDateStr() } });
      setCashTransfer(res.data || null);
    } catch {
      setCashTransfer(null);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const deliveredTodayCodTotal = useMemo(() => {
    const now = new Date();
    return orders
      .filter((o) => o.status === 'Delivered' && o.paymentMethod !== 'PREPAID' && isSameLocalDay(o.updatedAt, now))
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  useEffect(() => {
    const done = orders.length > 0 && orders.every((o) => o.status === 'Delivered');
    if (done && orders.length > 0 && deliveredTodayCodTotal > 0) fetchCashTransfer();
    else setCashTransfer(null);
  }, [orders, deliveredTodayCodTotal]);

  // Use API order (runOrder); pending = not yet delivered
  const pendingOrders = useMemo(() => orders.filter((o) => o.status !== 'Delivered'), [orders]);
  const nextDelivery = pendingOrders[0] ?? null;
  const restPending = pendingOrders.slice(1);
  const allDelivered = orders.length > 0 && orders.every((o) => o.status === 'Delivered');
  const canTurnOn = pendingOrders.length > 0;
  const canTurnOff = pendingOrders.length === 0;

  const handleShiftToggle = () => {
    if (!online) {
      if (!canTurnOn) {
        toast.error('No deliveries to do. You can start your shift when you have packed orders assigned.');
        return;
      }
      setOnline(true);
    } else {
      if (!canTurnOff) {
        toast.error('Finish all deliveries before ending your shift.');
        return;
      }
      setOnline(false);
    }
  };

  const deliveredOrderIds = useMemo(() => orders.filter((o) => o.status === 'Delivered').map((o) => o._id), [orders]);

  const reorderDeliveries = async (newPendingIds) => {
    if (newPendingIds.length === 0 && deliveredOrderIds.length === 0) return;
    setReordering(true);
    try {
      const orderIds = deliveredOrderIds.length ? [...newPendingIds, ...deliveredOrderIds] : newPendingIds;
      await api.put('/orders/assigned/reorder', { orderIds });
      toast.success('Delivery order updated');
      await fetchAssignedOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    const ids = pendingOrders.map((o) => o._id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderDeliveries(ids);
  };

  const moveDown = (index) => {
    if (index >= pendingOrders.length - 1) return;
    const ids = pendingOrders.map((o) => o._id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderDeliveries(ids);
  };

  const markAsTransferred = async () => {
    if (cashToSettle <= 0) return;
    setMarkingTransferred(true);
    try {
      await api.post('/orders/partner/cash-transferred', { date: todayDateStr(), amount: cashToSettle });
      toast.success('Marked as transferred. Admin will verify.');
      // Hide the transfer panel immediately after marking.
      setCashTransfer({ status: 'pending' });
      await fetchCashTransfer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as transferred');
    } finally {
      setMarkingTransferred(false);
    }
  };

  const totalDeliveries = pendingOrders.length;
  const cashToCollect = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'Delivered' && (o.paymentMethod !== 'PREPAID'))
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [orders]
  );
  const cashToSettle = deliveredTodayCodTotal;

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus === 'Delivered' ? 'marked delivered' : 'updated'}`);
      await fetchAssignedOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
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
            aria-disabled={(!online && !canTurnOn) || (online && !canTurnOff)}
            onClick={handleShiftToggle}
            disabled={(!online && !canTurnOn) || (online && !canTurnOff)}
            style={{
              width: 56,
              height: 32,
              borderRadius: 16,
              border: 'none',
              background: online ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
              cursor: ((!online && !canTurnOn) || (online && !canTurnOff)) ? 'not-allowed' : 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              opacity: ((!online && !canTurnOn) || (online && !canTurnOff)) ? 0.7 : 1,
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
          {!online && !canTurnOn && orders.length === 0 && (
            <span style={{ display: 'block', fontSize: 11, marginTop: 4, opacity: 0.85 }}>
              Start shift when you have packed orders assigned
            </span>
          )}
          {!online && !canTurnOn && orders.length > 0 && (
            <span style={{ display: 'block', fontSize: 11, marginTop: 4, opacity: 0.85 }}>
              All done for now. Start shift when new deliveries are packed
            </span>
          )}
          {online && !canTurnOff && (
            <span style={{ display: 'block', fontSize: 11, marginTop: 4, opacity: 0.85 }}>
              Complete all deliveries to end shift
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{totalDeliveries}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Deliveries to do</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>₹{cashToCollect.toLocaleString('en-IN')}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Cash to Collect (COD)</div>
          </div>
        </div>
      </section>

      {/* When shift is OFF: show full delivery list so partner can see all orders, reorder, and view details */}
      {!online && (
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
          <div style={{ padding: '12px 16px', background: '#475569', color: '#fff', fontSize: 14, fontWeight: 700 }}>
            Orders to deliver
          </div>
          <div style={{ padding: 12 }}>
            {pendingOrders.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                No deliveries assigned. Your list will appear here when orders are assigned.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingOrders.map((order, index) => (
                  <OrderListItem
                    key={order._id}
                    order={order}
                    index={index}
                    total={pendingOrders.length}
                    moveUp={moveUp}
                    moveDown={moveDown}
                    reordering={reordering}
                    expandedOrderId={expandedOrderId}
                    setExpandedOrderId={setExpandedOrderId}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Active Route – Next Delivery (when shift is ON) */}
      {online && nextDelivery ? (
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
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {nextDelivery.userId?.name || 'Customer'}
              </div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, marginBottom: 4 }}>
                {nextDelivery.userId?.address || 'No address'}
              </div>
              {nextDelivery.userId?.phone && (
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                  Contact: {nextDelivery.userId.phone}
                </div>
              )}
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

      {/* 3. Pending Delivery List (when shift is ON) – reorderable with details */}
      {online && restPending.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
            Delivery list – remaining ({restPending.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {restPending.map((order, i) => (
              <OrderListItem
                key={order._id}
                order={order}
                index={i + 1}
                total={pendingOrders.length}
                moveUp={() => moveUp(i + 1)}
                moveDown={() => moveDown(i + 1)}
                reordering={reordering}
                expandedOrderId={expandedOrderId}
                setExpandedOrderId={setExpandedOrderId}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. End of Shift – Total amount to transfer (hide once transfer is marked/exists) */}
      {allDelivered && orders.length > 0 && cashToSettle > 0 && !cashTransfer && (
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
            Total Amount to be transferred
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
            ₹{cashToSettle.toLocaleString('en-IN')}
          </div>
          <button
            type="button"
            onClick={markAsTransferred}
            disabled={markingTransferred || cashToSettle <= 0}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.95)',
              color: '#166534',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: markingTransferred || cashToSettle <= 0 ? 'not-allowed' : 'pointer',
              opacity: markingTransferred || cashToSettle <= 0 ? 0.8 : 1,
            }}
          >
            {markingTransferred ? '…' : 'Mark as Transferred'}
          </button>
        </section>
      )}

    </div>
  );
}
