import { createApiClient, getStoredToken } from './axios'

export const api = createApiClient({
  getToken: () => getStoredToken(),
})

