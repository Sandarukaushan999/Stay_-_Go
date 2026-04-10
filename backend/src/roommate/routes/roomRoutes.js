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
import { requireRole } from '../../common/middlewares/role.middleware.js'
import { ROLES } from '../../common/constants/roles.js'

export const roomRouter = Router()

roomRouter.use(requireAuth)

// Student & Admin — Read
roomRouter.get('/', getRooms)
roomRouter.get('/:id', getRoomById)

// Admin only — Write
const adminOnly = requireRole(ROLES.ADMIN, ROLES.SUPER_ADMIN)
roomRouter.post('/', adminOnly, createRoom)
roomRouter.put('/:id', adminOnly, updateRoom)
roomRouter.patch('/:id/status', adminOnly, updateRoomStatus)
roomRouter.post('/:id/assign', adminOnly, assignStudent)
