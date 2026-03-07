import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
