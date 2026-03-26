import api from './axios.js';

export const getAllUsers = (role) =>
  api.get('/admin/users', { params: role ? { role } : undefined });

export const updateUserStatus = (id, isActive) =>
  api.patch(`/admin/users/${id}/status`, { isActive });

export const getStats = () => api.get('/admin/stats');
