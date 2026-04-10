import api from '../../../lib/axios';

export const rideApi = {
  requestRide: (payload) => api.post('/ride-sharing/rides/request', payload),
  nearbyRiders: (params) => api.get('/ride-sharing/rides/nearby-riders', { params }),
  myRequests: () => api.get('/ride-sharing/rides/my-requests'),
  riderDashboard: () => api.get('/ride-sharing/rider/dashboard'),
  acceptRide: (id) => api.post(`/ride-sharing/rides/${id}/accept`),
  startRide: (id) => api.post(`/ride-sharing/rides/${id}/start`),
  completeRide: (id) => api.post(`/ride-sharing/rides/${id}/complete`),
  cancelRide: (id) => api.post(`/ride-sharing/rides/${id}/cancel`),
  confirmPickup: (tripId) => api.post(`/ride-sharing/trips/${tripId}/confirm-pickup`),
  finishTrip: (tripId) => api.post(`/ride-sharing/trips/${tripId}/finish`),
  sos: (id, payload) => api.post(`/ride-sharing/trips/${id}/sos`, payload),
};
