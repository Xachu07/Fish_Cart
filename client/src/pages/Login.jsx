import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect after a tick so auth context state is committed before AdminRoute checks user
        const role = result.user?.role;
        const path = role === 'admin' ? '/admin' : role === 'partner' ? '/partner' : '/';
        setTimeout(() => navigate(path, { replace: true }), 0);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '70vh', background: 'var(--sea-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ marginBottom: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--sea-600)' }}>Fish Cart</div>
          <div style={{ marginTop: 8, color: 'var(--text)' }}>Welcome back — login to continue</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 12px 32px rgba(12,74,63,0.06)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0' }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', marginBottom: 6, color: 'var(--text)', fontWeight: 600 }}>Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e6eef0' }}
              />
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--sea-600)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ marginTop: 12, textAlign: 'center' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--sea-600)', textDecoration: 'none', fontWeight: 700 }}>Create here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
