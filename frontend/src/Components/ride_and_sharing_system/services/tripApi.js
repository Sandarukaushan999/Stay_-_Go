import api from '../../../lib/axios';

export const tripApi = {
  updateLocation: (id, payload) => api.post(`/ride-sharing/trips/${id}/location-update`, payload),
  // Admin monitoring is part of Admin/User Management, not ride module.
  adminTrips: (params) => {
    if (params?.status === 'overdue') return api.get('/admin/trips/overdue')
    return api.get('/admin/trips/active')
  },
  sosList: (params) => api.get('/admin/sos', { params }),
};
