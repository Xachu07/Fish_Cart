import axios from 'axios';

// In production (e.g. Vercel), set VITE_API_URL to your deployed API (e.g. https://your-api.onrender.com/api)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Per-tab token (in-memory) so multiple tabs can use different accounts
let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

function getToken() {
  if (inMemoryToken != null) return inMemoryToken;
  return localStorage.getItem('token');
}

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
