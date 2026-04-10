import api from './axios';

export const createRoom = (data) => api.post('/roommate/rooms', data);
export const listRooms = (params) => api.get('/roommate/rooms', { params });
export const getRoomById = (id) => api.get(`/roommate/rooms/${id}`);
export const updateRoom = (id, data) => api.put(`/roommate/rooms/${id}`, data);
export const updateRoomStatus = (id, availabilityStatus) => api.patch(`/roommate/rooms/${id}/status`, { availabilityStatus });
export const assignStudent = (id, studentId) => api.post(`/roommate/rooms/${id}/assign`, { studentId });
