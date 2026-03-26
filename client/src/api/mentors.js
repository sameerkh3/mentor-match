import api from './axios.js';

export const getMentors = (params) => api.get('/mentors', { params });
export const getMentorById = (id) => api.get(`/mentors/${id}`);
export const updateProfile = (data) => api.put('/mentors/profile', data);
export const suggestMentors = (query) => api.post('/mentors/suggest', { query });
