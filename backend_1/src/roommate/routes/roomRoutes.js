import { Router } from 'express'
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  assignStudent,
} from '../controllers/roomController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const roomRouter = Router()

roomRouter.use(requireAuth)

// Student & Admin — Read
roomRouter.get('/', getRooms)
roomRouter.get('/:id', getRoomById)

// Admin only — Write
roomRouter.post('/', createRoom)
roomRouter.put('/:id', updateRoom)
roomRouter.patch('/:id/status', updateRoomStatus)
roomRouter.post('/:id/assign', assignStudent)
