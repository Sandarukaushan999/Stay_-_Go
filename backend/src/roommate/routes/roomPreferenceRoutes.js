import { Router } from 'express'
import {
  createOrUpdatePreference,
  getMyPreference,
} from '../controllers/roomPreferenceController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const preferenceRouter = Router()

preferenceRouter.use(requireAuth)

preferenceRouter.post('/', createOrUpdatePreference)
preferenceRouter.put('/me', createOrUpdatePreference)   // same upsert logic
preferenceRouter.get('/me', getMyPreference)
