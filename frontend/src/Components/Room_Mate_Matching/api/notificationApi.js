import api from './axios';

export const getMyNotifications = (page = 1, limit = 20) => api.get(`/roommate/notifications?page=${page}&limit=${limit}`);
export const markAllAsRead = () => api.patch('/roommate/notifications/read-all');
export const markAsRead = (notificationId) => api.patch(`/roommate/notifications/${notificationId}/read`);
