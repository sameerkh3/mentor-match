import api from './axios.js';

export const sendRequest = (data) => api.post('/requests', data);
export const getSentRequests = () => api.get('/requests/sent');
export const getReceivedRequests = () => api.get('/requests/received');
export const updateRequestStatus = (id, status) => api.patch(`/requests/${id}/status`, { status });
