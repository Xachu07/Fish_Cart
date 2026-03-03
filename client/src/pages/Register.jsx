import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import PasswordInput from '../components/PasswordInput';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    areaId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api
      .get('/areas')
      .then((res) => {
        if (mounted) setAreas(res.data || []);
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
    setError('');
    setLoading(true);

    const name = (formData.name || '').trim();
    const email = (formData.email || '').trim().toLowerCase();
    const phoneRaw = (formData.phone || '').trim();
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    const address = (formData.address || '').trim();

    if (!name || name.length < 2) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }
    if (!/^[A-Za-z\s.\-]+$/.test(name)) {
      setError('Please enter a valid full name');
      setLoading(false);
      return;
    }
    const atIdx = email.indexOf('@');
    if (!email || atIdx < 1 || !email.includes('.', atIdx + 1) || email.length < 5) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (phoneDigits.length !== 10 || !/^[6-9]/.test(phoneDigits)) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (address && address.length < 2) {
      setError('Please enter a valid delivery address');
      setLoading(false);
      return;
    }

    const result = await register(
      name,
      email,
      formData.password,
      formData.confirmPassword,
      phoneDigits,
      address,
      formData.areaId || undefined
    );

    if (result.success) {
      toast.success('Registration successful');
      navigate('/');
    } else {
      setError(result.message || 'Registration failed');
      toast.error(result.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '70vh', background: 'var(--sea-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--sea-600)' }}>Fish Cart</div>
          <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: 'var(--sea-600)' }}>Create your account</div>
        </div>

        {/* Form Card */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 12px 32px rgba(12,74,63,0.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Mobile Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Full Delivery Address</label>
              <textarea
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Delivery Area</label>
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="">Select your area...</option>
                {areas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Password</label>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>Confirm Password</label>
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                background: 'var(--sea-600)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <span style={{ color: 'var(--text)', fontSize: 14 }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--sea-600)', textDecoration: 'none', fontWeight: 700 }}>
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
