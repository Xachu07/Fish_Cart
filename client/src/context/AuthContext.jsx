import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
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
      setUser(res.data.user);
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
      setUser(res.data.user);
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
    setUser(null);
  };

  const switchUser = async (role) => {
    const token = localStorage.getItem(`token_${role}`);
    if (!token) return null;
    localStorage.setItem('token', token);
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      localStorage.removeItem('token');
      if (role) localStorage.removeItem(`token_${role}`);
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
