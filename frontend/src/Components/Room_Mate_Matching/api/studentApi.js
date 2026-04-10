import api from './axios';

export const createProfile = (data) => api.post('/roommate/students/profile', data);
export const getMyProfile = () => api.get('/roommate/students/profile/me');
export const updateMyProfile = (data) => api.put('/roommate/students/profile/me', data);
