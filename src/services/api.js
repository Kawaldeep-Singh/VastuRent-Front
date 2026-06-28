import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'https://vasturent-backend.onrender.com/api';

// Normalize URL to always end with /api
if (API_URL) {
  API_URL = API_URL.replace(/\/+$/, ''); // Remove trailing slashes
  if (!API_URL.endsWith('/api')) {
    API_URL = API_URL + '/api';
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("JWT token expired or unauthorized. Logging out...");
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
