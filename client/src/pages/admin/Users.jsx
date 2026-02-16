import { useEffect, useState } from 'react';
import api from '../../utils/api';

const Users = () => {
  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', phone: '', password: '', areaId: '' });
  const [areas, setAreas] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, partRes, areasRes] = await Promise.all([
        api.get('/api/admin/users?role=user'),
        api.get('/api/admin/users?role=partner'),
        api.get('/areas'),
      ]);
      setCustomers(custRes.data);
      setPartners(partRes.data);
      setAreas(areasRes.data);
    } catch (err) {
      console.error('Fetch users error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleBlock = async (id) => {
    try {
      await api.put(`/api/admin/users/${id}/block`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePartnerChange = (e) => {
    setPartnerForm({ ...partnerForm, [e.target.name]: e.target.value });
  };

  const createPartner = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/create-partner', partnerForm);
      setPartnerForm({ name: '', email: '', phone: '', password: '', areaId: '' });
      fetchData();
    } catch (err) {
      console.error('Create partner error', err);
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Users</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <section style={{ marginTop: 12 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Customers</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Area</th>
                    <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((u) => (
                    <tr key={u._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: 8 }}>{u.name}</td>
                      <td style={{ padding: 8 }}>{u.email}</td>
                      <td style={{ padding: 8 }}>{u.phone || '-'}</td>
                      <td style={{ padding: 8 }}>{u.areaOfService?.name || '-'}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => toggleBlock(u._id)} style={{ padding: '6px 8px', borderRadius: 6, background: u.isBlocked ? '#16a34a' : '#dc2626', color: '#fff', border: 'none' }}>
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Delivery Partners</h3>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Phone</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Area</th>
                        <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.map((p) => (
                        <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: 8 }}>{p.name}</td>
                          <td style={{ padding: 8 }}>{p.email}</td>
                          <td style={{ padding: 8 }}>{p.phone || '-'}</td>
                          <td style={{ padding: 8 }}>{p.areaOfService?.name || '-'}</td>
                          <td style={{ padding: 8 }}>
                            <button onClick={() => toggleBlock(p._id)} style={{ padding: '6px 8px', borderRadius: 6, background: p.isBlocked ? '#16a34a' : '#dc2626', color: '#fff', border: 'none' }}>
                              {p.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ width: 320 }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                  <h4 style={{ marginBottom: 8 }}>Register Partner</h4>
                  <form onSubmit={createPartner} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input name="name" value={partnerForm.name} onChange={handlePartnerChange} placeholder="Full name" required style={{ padding: 8 }} />
                    <input name="email" value={partnerForm.email} onChange={handlePartnerChange} placeholder="email@example.com" required style={{ padding: 8 }} />
                    <input name="phone" value={partnerForm.phone} onChange={handlePartnerChange} placeholder="Phone" required style={{ padding: 8 }} />
                    <input name="password" value={partnerForm.password} onChange={handlePartnerChange} placeholder="Temp password" required style={{ padding: 8 }} />
                    <select name="areaId" value={partnerForm.areaId} onChange={handlePartnerChange} style={{ padding: 8 }}>
                      <option value="">Assign area</option>
                      {areas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                    </select>
                    <button type="submit" style={{ padding: 8, background: '#0369a1', color: '#fff', border: 'none', borderRadius: 6 }}>Create Partner</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Users;

