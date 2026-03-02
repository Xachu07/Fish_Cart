import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Plus, MapPin, FileText, UserX, Trash2, X } from 'lucide-react';

const STATUS_CONFIG = {
  Available: { label: 'Available', bg: '#ecfdf5', color: '#065f46', dot: '🟢' },
  'On Route': { label: 'On Route', bg: '#dbeafe', color: '#1e40af', dot: '🔵' },
  'Off Duty': { label: 'Off Duty', bg: '#fee2e2', color: '#991b1b', dot: '🔴' },
};

export default function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [areas, setAreas] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editRoutePartner, setEditRoutePartner] = useState(null);
  const [runSheetPartner, setRunSheetPartner] = useState(null);
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', phone: '', password: '', areaId: '' });

  const fetchAreas = async () => {
    try {
      const res = await api.get('/areas');
      setAreas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch areas error', err);
      toast.error('Failed to load areas of service');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, areasRes, ordersRes] = await Promise.all([
        api.get('/admin/partners/overview'),
        api.get('/areas'),
        api.get('/orders/admin').catch(() => ({ data: [] })),
      ]);
      setPartners(Array.isArray(overviewRes.data) ? overviewRes.data : []);
      setAreas(Array.isArray(areasRes.data) ? areasRes.data : []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error('Fetch error', err);
      toast.error('Failed to load delivery partners');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch areas when opening Add New Partner so "Select area" always has every area of service
  const openAddModal = () => {
    fetchAreas();
    setAddModalOpen(true);
  };

  const filteredPartners = areaFilter
    ? partners.filter((p) => (p.areaOfService?.name || '') === areaFilter)
    : partners;

  const handlePartnerChange = (e) => {
    setPartnerForm({ ...partnerForm, [e.target.name]: e.target.value });
  };

  const createPartner = async (e) => {
    e.preventDefault();
    const phoneDigits = (partnerForm.phone || '').replace(/\D/g, '');
    const payload = {
      name: (partnerForm.name || '').trim(),
      email: (partnerForm.email || '').trim().toLowerCase(),
      phone: phoneDigits || partnerForm.phone,
      password: partnerForm.password,
      areaId: partnerForm.areaId || null,
    };
    try {
      await api.post('/admin/create-partner', payload);
      setPartnerForm({ name: '', email: '', phone: '', password: '', areaId: '' });
      setAddModalOpen(false);
      await fetchData();
      toast.success('Delivery partner created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create partner');
    }
  };

  const toggleBlock = async (partner) => {
    try {
      await api.put(`/admin/users/${partner._id}/block`);
      await fetchData();
      toast.success(partner.isBlocked ? 'Partner activated' : 'Partner deactivated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (partner) => {
    if (!window.confirm(`Remove ${partner.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${partner._id}`);
      setEditRoutePartner(null);
      setRunSheetPartner(null);
      await fetchData();
      toast.success('Partner removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const saveEditRoute = async (partnerId, areaId) => {
    try {
      await api.put(`/admin/users/${partnerId}`, { areaId: areaId || null });
      setEditRoutePartner(null);
      await fetchData();
      toast.success('Assigned area updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const getOrdersForPartner = (partnerId) => {
    const id = partnerId?.toString?.() || partnerId;
    return orders.filter((o) => (o.assignedPartnerId?._id || o.assignedPartnerId)?.toString?.() === id);
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Delivery Partner Overview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            title="Filter by area of service"
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
          <button
            type="button"
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: 'var(--sea-600)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
            Add New Partner
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Driver Name</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Assigned Area</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Current Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Today's Load</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Cash to Collect (COD)</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Completed Deliveries</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading...</td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                    {partners.length === 0 ? 'No delivery partners yet.' : 'No partners in this area.'}
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  const statusConf = STATUS_CONFIG[p.currentStatus] || STATUS_CONFIG.Available;
                  return (
                    <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>{p.phone || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>{p.areaOfService?.name || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusConf.bg, color: statusConf.color }}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{p.todayLoad ?? 0}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>₹{Number(p.cashToCollect ?? 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {p.completedDeliveries ?? 0}/{p.todayLoad ?? 0} Delivered
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setEditRoutePartner(p)}
                            style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, color: 'var(--sea-600)', background: 'rgba(15,118,110,0.08)', border: '1px solid rgba(15,118,110,0.25)', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title="Edit route / area"
                          >
                            <MapPin size={14} /> Edit Route
                          </button>
                          <button
                            type="button"
                            onClick={() => setRunSheetPartner(p)}
                            style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title="View run sheet"
                          >
                            <FileText size={14} /> Run Sheet
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBlock(p)}
                            style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            title={p.isBlocked ? 'Activate' : 'Deactivate'}
                          >
                            <UserX size={14} /> {p.isBlocked ? 'Activate' : 'Deactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            style={{ padding: 6, color: '#b91c1c', background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: 6, cursor: 'pointer' }}
                            title="Delete partner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Partner Modal */}
      {addModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.4)' }} onClick={() => setAddModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, width: '100%', padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add New Partner</h2>
              <button type="button" onClick={() => setAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
            </div>
            <form onSubmit={createPartner} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input name="name" value={partnerForm.name} onChange={handlePartnerChange} placeholder="Driver name" required style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <input name="email" type="email" value={partnerForm.email} onChange={handlePartnerChange} placeholder="Email" required style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <input name="phone" type="tel" value={partnerForm.phone} onChange={handlePartnerChange} placeholder="Phone" required style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <input name="password" type="password" value={partnerForm.password} onChange={handlePartnerChange} placeholder="Temporary password" required style={{ padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Area of service</label>
                <select name="areaId" value={partnerForm.areaId} onChange={handlePartnerChange} style={{ width: '100%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <option value="">Select area of service</option>
                  {areas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ padding: 12, background: 'var(--sea-600)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Create Partner</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Route Modal */}
      {editRoutePartner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.4)' }} onClick={() => setEditRoutePartner(null)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 360, width: '100%', padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Edit Route – {editRoutePartner.name}</h3>
            <EditRouteForm partner={editRoutePartner} areas={areas} onSave={(areaId) => saveEditRoute(editRoutePartner._id, areaId)} onClose={() => setEditRoutePartner(null)} />
          </div>
        </div>
      )}

      {/* View Run Sheet Modal */}
      {runSheetPartner && (
        <RunSheetModal partner={runSheetPartner} orders={getOrdersForPartner(runSheetPartner._id)} onClose={() => setRunSheetPartner(null)} />
      )}
    </div>
  );
}

function EditRouteForm({ partner, areas, onSave, onClose }) {
  const [areaId, setAreaId] = useState(partner.areaOfService?._id || partner.areaOfService || '');
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Assigned Area</label>
      <select value={areaId} onChange={(e) => setAreaId(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
        <option value="">— None —</option>
        {areas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
        <button type="button" onClick={() => onSave(areaId || null)} style={{ padding: '8px 16px', background: 'var(--sea-600)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save</button>
      </div>
    </div>
  );
}

function RunSheetModal({ partner, orders, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,23,42,0.4)' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Run Sheet – {partner.name}</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
          {orders.length === 0 ? (
            <p style={{ color: '#64748b', margin: 0 }}>No orders assigned for delivery today.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {orders.map((o) => (
                <li key={o._id} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{o.userId?.name || 'Customer'}</span>
                  {' — '}{o.userId?.address || 'No address'}
                  {' · '}<span style={{ color: '#64748b' }}>{o.status}</span>
                  {' · ₹'}{Number(o.totalAmount || 0).toLocaleString('en-IN')}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
