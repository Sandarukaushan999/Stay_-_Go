import { asyncHandler } from '../../common/utils/asyncHandler.js'
import * as userService from '../users/user.service.js'
import * as tripService from '../ride_sharing/services/trip.service.js'
import * as sosService from '../ride_sharing/services/sos.service.js'
import { AdminActionLog } from './models/AdminActionLog.js'

export const dashboard = asyncHandler(async (req, res) => {
  const counts = await userService.dashboardCounts()
  res.json({ success: true, counts })
})

export const listUsers = asyncHandler(async (req, res) => {
  const { q, role, page, limit } = req.query
  const data = await userService.listUsers({ q, role, page, limit })
  res.json({ success: true, ...data })
})

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body)
  res.status(201).json({ success: true, user })
})

export const setBlocked = asyncHandler(async (req, res) => {
  const user = await userService.setBlocked(req.params.id, req.body.isBlocked)
  res.json({ success: true, user })
})

export const setRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.role)

  await AdminActionLog.create({
    adminId: req.user.id,
    actionType: 'ROLE_UPDATE',
    description: `Modified role for user ${user.email} -> ${req.body.role}`,
    targetId: user.id,
  })

  res.json({ success: true, user })
})

export const approveRider = asyncHandler(async (req, res) => {
  const user = await userService.approveRider(req.params.id, req.body.approved)
  res.json({ success: true, user })
})

export const pendingRiders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query
  const data = await userService.listPendingRiders({ page, limit })
  res.json({ success: true, ...data })
})

export const activeTrips = asyncHandler(async (req, res) => {
  const items = await tripService.listActiveTrips()
  res.json({ success: true, items })
})

export const overdueTrips = asyncHandler(async (req, res) => {
  const items = await tripService.listOverdueTrips()
  res.json({ success: true, items })
})

export const listSos = asyncHandler(async (req, res) => {
  const items = await sosService.listSos({ status: req.query.status })
  res.json({ success: true, items })
})

export const acknowledgeSos = asyncHandler(async (req, res) => {
  const sos = await sosService.acknowledgeSos(req.params.id)
  res.json({ success: true, sos })
})

export const resolveSos = asyncHandler(async (req, res) => {
  const sos = await sosService.resolveSos(req.params.id)
  res.json({ success: true, sos })
})
