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

    try {
      const payload = { ...formData };
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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>My Profile</h2>

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

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <strong>Email:</strong> {user.email}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Role:</strong> {user.role === 'user' ? 'Customer' : user.role === 'admin' ? 'Admin' : 'Delivery Partner'}
        </div>
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
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      {/* Change Password */}
      <div style={{ marginTop: 20, borderTop: '1px solid #eef2f7', paddingTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Change Password</h3>
        <ChangePasswordForm />
      </div>

      {/* Change Email */}
      <div style={{ marginTop: 20, borderTop: '1px solid #eef2f7', paddingTop: 16 }}>
        <h3 style={{ marginBottom: 8 }}>Change Email</h3>
        <ChangeEmailForm />
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
    try {
      setLoadingPw(true);
      const res = await api.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      const m = res.data.message || 'Password changed';
      toast.success(m);
      setMsg(m);
      setForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      const m = err.response?.data?.message || 'Failed to change password';
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
      <button type="submit" disabled={loadingPw} style={{ padding: 8, background: '#0369a1', color: '#fff', border: 'none', borderRadius: 6 }}>
        {loadingPw ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

const ChangeEmailForm = () => {
  const [form, setForm] = useState({ newEmail: '' });
  const [loadingE, setLoadingE] = useState(false);
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.newEmail) {
      setMsg('Enter new email');
      return;
    }
    try {
      setLoadingE(true);
      const res = await api.put('/auth/change-email', { newEmail: form.newEmail });
      const m = res.data.message || 'Email updated';
      toast.success(m);
      setMsg(m);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update email');
    } finally {
      setLoadingE(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input name="newEmail" value={form.newEmail} onChange={onChange} placeholder="new-email@example.com" style={{ padding: 8, flex: 1 }} />
      <button type="submit" disabled={loadingE} style={{ padding: 8, background: '#0369a1', color: '#fff', border: 'none', borderRadius: 6 }}>
        {loadingE ? 'Updating...' : 'Update Email'}
      </button>
      {msg && <div style={{ marginLeft: 8, color: msg.includes('Failed') ? 'red' : 'green' }}>{msg}</div>}
    </form>
  );
};

export default Profile;
