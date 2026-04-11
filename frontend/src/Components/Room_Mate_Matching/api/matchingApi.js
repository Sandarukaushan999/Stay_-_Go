import api from './axios';

export const getSuggestions = () => api.get('/roommate/matching/suggestions');
export const getAllCompleteStudents = () => api.get('/roommate/matching/all-complete');
export const sendRequest = (receiverStudentId) => api.post(`/roommate/matching/requests/${receiverStudentId}`);
export const getSentRequests = () => api.get('/roommate/matching/requests/sent');
export const getReceivedRequests = () => api.get('/roommate/matching/requests/received');
export const acceptRequest = (requestId) => api.patch(`/roommate/matching/requests/${requestId}/accept`);
export const rejectRequest = (requestId) => api.patch(`/roommate/matching/requests/${requestId}/reject`);
export const cancelRequest = (requestId) => api.patch(`/roommate/matching/requests/${requestId}/cancel`);
export const getMyPair = () => api.get('/roommate/matching/pair/me');
