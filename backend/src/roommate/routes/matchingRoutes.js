import { Router } from 'express'
import {
  getSuggestions,
  sendRequest,
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getMyPair,
  getAllCompleteStudents,
} from '../controllers/matchingController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const matchingRouter = Router()

// All routes require authentication
matchingRouter.use(requireAuth)

matchingRouter.get('/all-complete', getAllCompleteStudents)
matchingRouter.get('/suggestions', getSuggestions)
matchingRouter.get('/me', getMyPair)                          // alias used by StudentDashboard
matchingRouter.post('/requests/:receiverStudentId', sendRequest)
matchingRouter.get('/requests/sent', getSentRequests)
matchingRouter.get('/requests/received', getReceivedRequests)
matchingRouter.patch('/requests/:requestId/accept', acceptRequest)
matchingRouter.patch('/requests/:requestId/reject', rejectRequest)
matchingRouter.patch('/requests/:requestId/cancel', cancelRequest)
matchingRouter.get('/pair/me', getMyPair)
