import api from './axios';

export const createIssue = (formData) => api.post('/roommate/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const getMyIssues = () => api.get('/roommate/issues/me');
export const getAllIssues = () => api.get('/roommate/issues');
export const updateIssueStatus = (issueId, status) => api.patch(`/roommate/issues/${issueId}/status`, { status });
export const addAdminComment = (issueId, adminComment) => api.patch(`/roommate/issues/${issueId}/comment`, { adminComment });
