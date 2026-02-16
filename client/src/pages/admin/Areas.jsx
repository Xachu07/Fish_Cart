import { useEffect, useState } from 'react';
import api from '../../utils/api';

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/areas');
      setAreas(res.data);
    } catch (err) {
      console.error('Fetch areas error', err);
      setError('Failed to load areas');
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
      await api.post('/areas', { name: name.trim() });
      setName('');
      fetchAreas();
    } catch (err) {
      console.error('Add area error', err);
      setError(err.response?.data?.message || 'Failed to add area');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this area?')) return;
    try {
      await api.delete(`/areas/${id}`);
      fetchAreas();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleEdit = async (id) => {
    const newName = prompt('New area name');
    if (!newName) return;
    try {
      await api.put(`/areas/${id}`, { name: newName });
      fetchAreas();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to edit');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Areas of Service</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New area name"
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', minWidth: 240 }}
        />
        <button type="submit" disabled={saving} style={{ padding: '8px 12px', borderRadius: 6, background: '#0369a1', color: '#fff', border: 'none' }}>
          {saving ? 'Adding...' : 'Add Area'}
        </button>
      </form>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: 8, background: '#f8fafc', fontSize: 13, fontWeight: 600 }}>Available Areas</div>
        <div style={{ padding: 8 }}>
          {loading ? (
            <div>Loading...</div>
          ) : areas.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No areas added yet.</div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {areas.map((a) => (
                <li key={a._id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14 }}>{a.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(a.createdAt).toLocaleDateString()}</div>
                      <button onClick={() => handleEdit(a._id)} style={{ padding: '6px 8px', borderRadius: 6, background: '#0369a1', color: '#fff', border: 'none' }}>Edit</button>
                      <button onClick={() => handleDelete(a._id)} style={{ padding: '6px 8px', borderRadius: 6, background: '#dc2626', color: '#fff', border: 'none' }}>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Areas;

