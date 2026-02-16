import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, login, register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
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
        // if user has area, ensure it's set
        if (user && user.areaOfService) {
          setFormData((f) => ({ ...f, areaId: user.areaOfService.id }));
        }
      })
      .catch(() => {
        if (mounted) setAreas([]);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // client-side validation
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
      toast.error('Phone must be a 10-digit number');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, name: nameTrim };
      // include areaId if present
      if (formData.areaId) payload.areaId = formData.areaId;
      const res = await api.put('/auth/profile', payload);
      toast.success('Profile updated');
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#28a745';
      case 'rejected':
        return '#dc3545';
      case 'pending':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
      <style>
        {`
          /* center the two-column block by giving both columns a fixed max width */
          .profile-grid { display: grid; grid-template-columns: repeat(2, minmax(300px, 420px)); gap: 24px; justify-content: center; }
          @media (max-width: 1024px) { .profile-grid { grid-template-columns: 1fr minmax(280px, 420px); } }
          @media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } }
          .profile-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; background: #fff; }
          .profile-aside-card { border: 1px solid #eef2f7; padding: 16px; border-radius: 8px; background: #fff; }
          .profile-heading { font-size: 20px; font-weight: 700; margin-bottom: 14px; color: #0f1724; }
        `}
      </style>
      <h2 className="profile-heading">My Profile</h2>

      {message.text && (
        <div
          style={{
            padding: '15px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(300px, 420px))', gap: 24 }}>
        {/* LEFT: Profile summary + Update form */}
        <div>
          <div className="profile-card" style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Name:</strong> {user.name || formData.name}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Phone:</strong> {user.phone || formData.phone}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Email:</strong> {user.email}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Role:</strong> {user.role === 'user' ? 'Customer' : user.role === 'admin' ? 'Admin' : 'Delivery Partner'}
            </div>
            {user.role !== 'admin' && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Account Status:</strong>{' '}
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    backgroundColor: getStatusColor(user.status || 'pending'),
                    color: 'white',
                    fontSize: '14px',
                  }}
                >
                  {(user.status || 'pending').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            {user.role !== 'admin' && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label>Address:</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="4"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label>Area of Service:</label>
                  <select
                    name="areaId"
                    value={formData.areaId || ''}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  >
                    <option value="">Select area (optional)</option>
                    {areas.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#0f766e',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* RIGHT: Change Password / Change Email */}
        <aside>
          <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="profile-aside-card">
              <h3 style={{ marginBottom: 8 }}>Change Password</h3>
              <ChangePasswordForm />
            </div>
            <div className="profile-aside-card">
              <h3 style={{ marginBottom: 8 }}>Change Email</h3>
              <ChangeEmailForm />
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
};

const ChangePasswordForm = () => {
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
      // normalize common server responses about incorrect current password
      const status = err.response?.status;
      const lower = (m || '').toLowerCase();
      if (status === 401 || lower.includes('current') && lower.includes('password') || lower.includes('incorrect')) {
        m = 'Current password is incorrect';
      }
      toast.error(m);
      setMsg(m);
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input name="currentPassword" type="password" value={form.currentPassword} onChange={onChange} placeholder="Current password" style={{ padding: 8 }} />
      <input name="newPassword" type="password" value={form.newPassword} onChange={onChange} placeholder="New password" style={{ padding: 8 }} />
      <input name="confirmNew" type="password" value={form.confirmNew} onChange={onChange} placeholder="Confirm new password" style={{ padding: 8 }} />
      {msg && <div style={{ color: msg.includes('Failed') ? 'red' : 'green' }}>{msg}</div>}
      <button type="submit" disabled={loadingPw} style={{ padding: 8, background: '#0f766e', color: '#fff', border: 'none', borderRadius: 6 }}>
        {loadingPw ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

const ChangeEmailForm = () => {
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
    // basic validation: must contain @ and end with .com
    const email = (form.newEmail || '').trim();
    const emailValid = /@/.test(email) && /\.com$/i.test(email);
    if (!emailValid) {
      setMsg('Please enter valid e-mail');
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
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        name="password"
        value={form.password}
        onChange={onChange}
        placeholder="Enter current password"
        type="password"
        style={{ padding: 8 }}
      />
      <input
        name="newEmail"
        value={form.newEmail}
        onChange={onChange}
        placeholder="Enter new email (e.g. user@example.com)"
        style={{ padding: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="submit" disabled={loadingE} style={{ padding: 8, background: '#0f766e', color: '#fff', border: 'none', borderRadius: 6 }}>
          {loadingE ? 'Updating...' : 'Update Email'}
        </button>
        {msg && <div style={{ color: msg.includes('Failed') || msg.includes('incorrect') ? 'red' : 'green' }}>{msg}</div>}
      </div>
    </form>
  );
};

export default Profile;
