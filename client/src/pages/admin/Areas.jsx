import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/areas');
      setAreas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch areas error', err);
      toast.error('Failed to load areas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post('/areas', { name: name.trim(), areaCode: areaCode.trim().toUpperCase().slice(0, 3) || undefined });
      setName('');
      setAreaCode('');
      fetchAreas();
      toast.success('Area added successfully.');
    } catch (err) {
      console.error('Add area error', err);
      toast.error(err.response?.data?.message || 'Failed to add area');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this area? This cannot be undone.')) return;
    try {
      await api.delete(`/areas/${id}`);
      fetchAreas();
      toast.success('Area deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const openEdit = (area) => {
    setEditingArea(area);
    setEditName(area?.name || '');
    setEditCode(area?.areaCode || '');
  };

  const closeEdit = () => {
    setEditingArea(null);
    setEditName('');
    setEditCode('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingArea) return;
    setSaving(true);
    try {
      await api.put(`/areas/${editingArea._id}`, {
        name: editName.trim() || editingArea.name,
        areaCode: (editCode != null && String(editCode).trim()) ? String(editCode).trim().toUpperCase().slice(0, 3) : '',
      });
      fetchAreas();
      toast.success('Area updated.');
      closeEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 896, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Areas of Service
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4, margin: 0 }}>
          Add and manage delivery areas.
        </p>
      </div>

      {/* Add area form */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', minWidth: 0 }}>
            <MapPin size={18} style={{ color: 'var(--sea-600)', flexShrink: 0 }} />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Area name"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 14,
                outline: 'none',
                background: '#fff',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--sea-600)';
                e.target.style.boxShadow = '0 0 0 2px rgba(15,118,110,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="e.g. CGN"
              maxLength={3}
              style={{
                width: 100,
                minWidth: 100,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: 14,
                outline: 'none',
                background: '#fff',
                textTransform: 'uppercase',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 8,
              background: 'var(--sea-600)',
              color: '#fff',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Plus size={18} />
            {saving ? 'Adding...' : 'Add Area'}
          </button>
        </form>
      </div>

      {/* Areas list card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 400, borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Area Name
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Area Code
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                    Loading areas...
                  </td>
                </tr>
              ) : areas.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
                    No areas added yet. Add one above.
                  </td>
                </tr>
              ) : (
                areas.map((a, idx) => (
                  <tr
                    key={a._id}
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#fff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{a.name}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: a.areaCode ? 'var(--sea-600)' : '#94a3b8', fontSize: 14 }}>{a.areaCode || '—'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--sea-600)',
                            background: 'transparent',
                            border: '1px solid rgba(15,118,110,0.4)',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a._id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#b91c1c',
                            background: 'transparent',
                            border: '1px solid #fecaca',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit area modal */}
      {editingArea && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeEdit}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit area</h3>
              <button type="button" onClick={closeEdit} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Area name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Area code (3 letters, e.g. CGN, TVL)</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase().slice(0, 3))}
                  maxLength={3}
                  placeholder="e.g. CGN"
                  style={{
                    width: '100%',
                    maxWidth: 100,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 14,
                    textTransform: 'uppercase',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeEdit} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: 'var(--sea-600)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Areas;
