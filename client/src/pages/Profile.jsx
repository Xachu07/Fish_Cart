import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';

const sectionStyle = {
  padding: '24px 16px 48px',
  maxWidth: 900,
  margin: '0 auto',
  fontFamily: "'Poppins', Inter, system-ui, sans-serif",
};
const pageTitle = {
  fontSize: 22,
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 24px',
};
const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
};
const cardTitle = {
  fontSize: 16,
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 16px',
};
const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#64748b',
  marginBottom: 6,
};
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  color: '#0f172a',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  boxSizing: 'border-box',
};
const valueStyle = {
  fontSize: 14,
  color: '#0f172a',
  fontWeight: 500,
};
const btnPrimary = {
  width: '100%',
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 600,
  color: '#fff',
  background: 'var(--sea-600)',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};
const msgError = { fontSize: 13, color: '#b91c1c', marginTop: 8 };
const msgSuccess = { fontSize: 13, color: '#15803d', marginTop: 8 };

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', areaId: '' });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        areaId: user.areaOfService?.id || user.areaOfService?._id || '',
      });
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;
    api
      .get('/areas')
      .then((res) => {
        if (!mounted) return;
        setAreas(res.data || []);
      })
      .catch(() => {
        if (mounted) setAreas([]);
      });
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    const nameTrim = (formData.name || '').trim();
    if (!nameTrim) {
      toast.error('Name is required');
      setLoading(false);
      return;
    }
    if (/\d/.test(nameTrim)) {
      toast.error('Name must not contain numbers');
      setLoading(false);
      return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }
    try {
      const payload = { ...formData, name: nameTrim };
      if (formData.areaId) payload.areaId = formData.areaId;
      await api.put('/auth/profile', payload);
      toast.success('Profile updated');
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ ...sectionStyle, padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ ...sectionStyle, background: 'var(--sea-50)', minHeight: '60vh' }}>
      <h1 style={pageTitle}>My Profile</h1>

      {message.text && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14,
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#b91c1c',
          }}
        >
          {message.text}
        </div>
      )}

      <style>{`@media (max-width: 768px) { .profile-two-col { grid-template-columns: 1fr; } }`}</style>
      <div className="profile-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          {user.role === 'partner' ? (
            <>
              <div style={cardStyle}>
                <h2 style={cardTitle}>Profile details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <span style={labelStyle}>Name</span>
                    <div style={valueStyle}>{user.name || '—'}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Mobile Number</span>
                    <div style={valueStyle}>{user.phone || '—'}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Email</span>
                    <div style={valueStyle}>{user.email || '—'}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Area of service (assigned by admin)</span>
                    <div style={valueStyle}>{user.areaOfService?.name || '—'}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={cardStyle}>
                <h2 style={cardTitle}>Profile summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span style={labelStyle}>Name</span>
                    <div style={valueStyle}>{user.name || formData.name || '—'}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Mobile Number</span>
                    <div style={valueStyle}>{user.phone || formData.phone || '—'}</div>
                  </div>
                  <div>
                    <span style={labelStyle}>Email</span>
                    <div style={valueStyle}>{user.email || '—'}</div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <h2 style={cardTitle}>Update profile</h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle} htmlFor="profile-name">Name</label>
                    <input
                      id="profile-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle} htmlFor="profile-phone">Mobile Number</label>
                    <input
                      id="profile-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      style={inputStyle}
                    />
                  </div>
                  {user.role !== 'admin' && (
                    <>
                      <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle} htmlFor="profile-address">Address</label>
                        <textarea
                          id="profile-address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={4}
                          placeholder="House name, street, landmark…"
                          style={{ ...inputStyle, resize: 'vertical', minHeight: 88 }}
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle} htmlFor="profile-area">Delivery area</label>
                        <select
                          id="profile-area"
                          name="areaId"
                          value={formData.areaId || ''}
                          onChange={handleChange}
                          style={inputStyle}
                        >
                          <option value="">Select area (optional)</option>
                          {areas.map((a) => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <button type="submit" disabled={loading} style={btnPrimary}>
                    {loading ? 'Updating…' : 'Update profile'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <h2 style={cardTitle}>Change password</h2>
            <ChangePasswordForm inputStyle={inputStyle} btnPrimary={btnPrimary} msgError={msgError} msgSuccess={msgSuccess} />
          </div>
          {user.role !== 'partner' && (
            <div style={{ ...cardStyle, marginBottom: 0 }}>
              <h2 style={cardTitle}>Change email</h2>
              <ChangeEmailForm inputStyle={inputStyle} btnPrimary={btnPrimary} msgError={msgError} msgSuccess={msgSuccess} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const ChangePasswordForm = ({ inputStyle, btnPrimary, msgError, msgSuccess }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [loadingPw, setLoadingPw] = useState(false);
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.currentPassword || !form.newPassword) {
      setMsg('Please fill passwords');
      return;
    }
    if (form.newPassword !== form.confirmNew) {
      setMsg('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      setMsg('New password must be at least 6 characters');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setMsg('New password must be different from current password');
      return;
    }
    try {
      setLoadingPw(true);
      const res = await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      const m = res.data.message || 'Password changed';
      toast.success(m);
      setMsg(m);
      setForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      let m = err.response?.data?.message || 'Failed to change password';
      const status = err.response?.status;
      const lower = (m || '').toLowerCase();
      if (status === 401 || (lower.includes('current') && lower.includes('password')) || lower.includes('incorrect')) {
        m = 'Current password is incorrect';
      }
      toast.error(m);
      setMsg(m);
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PasswordInput name="currentPassword" value={form.currentPassword} onChange={onChange} placeholder="Current password" style={{ ...inputStyle }} />
      <PasswordInput name="newPassword" value={form.newPassword} onChange={onChange} placeholder="New password" style={{ ...inputStyle }} />
      <PasswordInput name="confirmNew" value={form.confirmNew} onChange={onChange} placeholder="Confirm new password" style={{ ...inputStyle }} />
      {msg && <div style={msg.includes('Failed') || msg.includes('incorrect') || msg.includes('match') || msg.includes('different') ? msgError : msgSuccess}>{msg}</div>}
      <button type="submit" disabled={loadingPw} style={{ ...btnPrimary, cursor: loadingPw ? 'not-allowed' : 'pointer' }}>
        {loadingPw ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
};

const ChangeEmailForm = ({ inputStyle, btnPrimary, msgError, msgSuccess }) => {
  const [form, setForm] = useState({ password: '', newEmail: '' });
  const [loadingE, setLoadingE] = useState(false);
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.password) {
      setMsg('Enter your current password');
      return;
    }
    if (!form.newEmail) {
      setMsg('Enter new email');
      return;
    }
    const email = (form.newEmail || '').trim();
    const emailValid = /@/.test(email) && /\.com$/i.test(email);
    if (!emailValid) {
      setMsg('Please enter a valid email');
      return;
    }
    try {
      setLoadingE(true);
      const res = await api.put('/auth/change-email', { currentPassword: form.password, newEmail: form.newEmail });
      const m = res.data.message || 'Email updated';
      toast.success(m);
      setMsg(m);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 401 || (serverMsg || '').toLowerCase().includes('password')) {
        setMsg('Current password is incorrect');
      } else {
        setMsg(serverMsg || 'Failed to update email');
      }
    } finally {
      setLoadingE(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <PasswordInput name="password" value={form.password} onChange={onChange} placeholder="Current password" style={{ ...inputStyle }} />
      <input
        name="newEmail"
        type="email"
        value={form.newEmail}
        onChange={onChange}
        placeholder="New email (e.g. you@example.com)"
        style={inputStyle}
      />
      {msg && <div style={msg.includes('Failed') || msg.includes('incorrect') ? msgError : msgSuccess}>{msg}</div>}
      <button type="submit" disabled={loadingE} style={{ ...btnPrimary, cursor: loadingE ? 'not-allowed' : 'pointer' }}>
        {loadingE ? 'Updating…' : 'Update email'}
      </button>
    </form>
  );
};

export default Profile;
