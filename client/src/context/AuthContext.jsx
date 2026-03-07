import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { setAuthToken } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const asParam = searchParams.get('as'); // 'admin' | 'partner' | 'user' for multi-tab multi-account
  const sessionRole = ['admin', 'partner', 'user'].includes(asParam) ? asParam : null;

  useEffect(() => {
    checkAuth();
  }, [sessionRole]);

  const checkAuth = async () => {
    const token = sessionRole
      ? localStorage.getItem(`token_${sessionRole}`)
      : localStorage.getItem('token');
    setAuthToken(token);
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        if (sessionRole) localStorage.removeItem(`token_${sessionRole}`);
        setAuthToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const saveTokenByRole = (token, role) => {
    if (role) localStorage.setItem(`token_${role}`, token);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;
      const role = res.data.user?.role;
      localStorage.setItem('token', token);
      saveTokenByRole(token, role);
      setAuthToken(token);
      setUser(res.data.user);
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) setUser(meRes.data.user);
      } catch (_) {}
      return { success: true, user: res.data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, confirmPassword, phone, address, areaId) => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
        phone,
        address,
        areaId,
      });
      const token = res.data.token;
      const role = res.data.user?.role;
      localStorage.setItem('token', token);
      saveTokenByRole(token, role);
      setAuthToken(token);
      setUser(res.data.user);
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) setUser(meRes.data.user);
      } catch (_) {}
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    const role = user?.role;
    localStorage.removeItem('token');
    if (role) localStorage.removeItem(`token_${role}`);
    setAuthToken(null);
    setUser(null);
  };

  const switchUser = async (role) => {
    const token = localStorage.getItem(`token_${role}`);
    if (!token) return null;
    localStorage.setItem('token', token);
    setAuthToken(token);
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      localStorage.removeItem('token');
      if (role) localStorage.removeItem(`token_${role}`);
      setAuthToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getStoredRoles = () => {
    const roles = [];
    if (localStorage.getItem('token_admin')) roles.push('admin');
    if (localStorage.getItem('token_partner')) roles.push('partner');
    if (localStorage.getItem('token_user')) roles.push('user');
    return roles;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, switchUser, getStoredRoles }}>
      {children}
    </AuthContext.Provider>
  );
};
