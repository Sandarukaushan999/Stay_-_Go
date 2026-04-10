import api from './axios';

export const createOrUpdatePreference = (data) => api.post('/roommate/preferences', data);
export const getMyPreference = () => api.get('/roommate/preferences/me');
export const updateMyPreference = (data) => api.put('/roommate/preferences/me', data);
