import { Router } from 'express'
import {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getStudentById,
} from '../controllers/studentController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const studentRouter = Router()

studentRouter.use(requireAuth)

studentRouter.post('/profile', createProfile)
studentRouter.get('/profile/me', getMyProfile)
studentRouter.put('/profile/me', updateMyProfile)
studentRouter.get('/:id', getStudentById)
