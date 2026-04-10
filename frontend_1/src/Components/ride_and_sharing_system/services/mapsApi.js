import api from '../../../lib/axios';

export const mapsApi = {
  routePreview: (payload) => api.post('/ride-sharing/maps/route-preview', payload),
  reverseGeocode: (params) => api.get('/ride-sharing/maps/reverse-geocode', { params }),
};
