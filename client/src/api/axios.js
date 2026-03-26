import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// Global response error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Session expired or invalid — clear auth and redirect to login
      localStorage.removeItem('auth');
      window.location.href = '/login';
    } else if (err.response?.status === 403) {
      // Access denied — attach a friendly message for components to display
      err.friendlyMessage = err.response?.data?.error || 'Access denied.';
    } else if (!err.response) {
      // Network error (server down, no internet, etc.)
      err.friendlyMessage = 'Something went wrong. Please try again.';
    }
    return Promise.reject(err);
  }
);

export default api;
