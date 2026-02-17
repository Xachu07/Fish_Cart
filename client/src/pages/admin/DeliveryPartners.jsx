import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', email: '', phone: '', password: '', areaId: '' });
  const [areas, setAreas] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partRes, areasRes] = await Promise.all([
        api.get('/api/admin/users?role=partner'),
        api.get('/areas'),
      ]);
      setPartners(partRes.data || []);
      setAreas(areasRes.data || []);
    } catch (err) {
      console.error('Fetch partners error', err);
      toast.error('Failed to load delivery partners');
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
      await fetchData();
      toast.success('Partner status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update partner');
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
      await fetchData();
      toast.success('Delivery partner created successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create partner');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Delivery Partners</h2>
      <p style={{ marginTop: 8, color: '#6b7280', maxWidth: 800 }}>
        Assign delivery partners by providing their name, phone number, email, temporary password, and area of service.
        View all assigned delivery partners below.
      </p>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          {/* List of Partners */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>All Delivery Partners</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', background: '#fff' }}>
              {partners.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No delivery partners assigned yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Name</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Email</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Phone</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Area of Service</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Status</th>
                      <th style={{ padding: 12, textAlign: 'left', fontSize: 13, fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr key={p._id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 12 }}>{p.name}</td>
                        <td style={{ padding: 12 }}>{p.email}</td>
                        <td style={{ padding: 12 }}>{p.phone || '-'}</td>
                        <td style={{ padding: 12 }}>{p.areaOfService?.name || '-'}</td>
                        <td style={{ padding: 12 }}>
                          <span style={{ padding: '4px 8px', borderRadius: 6, background: p.isBlocked ? '#fff1f2' : '#ecfdf5', color: p.isBlocked ? '#991b1b' : '#065f46', fontSize: 12, fontWeight: 600 }}>
                            {p.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td style={{ padding: 12 }}>
                          <button
                            onClick={() => toggleBlock(p._id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              background: p.isBlocked ? '#16a34a' : '#dc2626',
                              color: '#fff',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            {p.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Create Partner Form */}
          <div style={{ width: 360 }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, fontWeight: 600 }}>Assign New Delivery Partner</h3>
              <form onSubmit={createPartner} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Name</label>
                  <input
                    name="name"
                    value={partnerForm.name}
                    onChange={handlePartnerChange}
                    placeholder="Full name"
                    required
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={partnerForm.email}
                    onChange={handlePartnerChange}
                    placeholder="email@example.com"
                    required
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    value={partnerForm.phone}
                    onChange={handlePartnerChange}
                    placeholder="Phone number"
                    required
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Temporary Password</label>
                  <input
                    name="password"
                    type="password"
                    value={partnerForm.password}
                    onChange={handlePartnerChange}
                    placeholder="Temporary password"
                    required
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Area of Service</label>
                  <select
                    name="areaId"
                    value={partnerForm.areaId}
                    onChange={handlePartnerChange}
                    style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                  >
                    <option value="">Select area</option>
                    {areas.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: 10,
                    background: '#0f766e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Create Delivery Partner
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;
