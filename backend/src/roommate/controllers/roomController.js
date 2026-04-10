import { Room } from '../models/Room.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { ApiError } from '../../common/utils/ApiError.js'

// GET /api/roommate/rooms — list rooms (filterable)
export const getRooms = async (req, res, next) => {
  try {
    const { block, floor, acType, capacity } = req.query

    const filter = {}
    if (block) filter.block = block
    if (floor) filter.floor = floor
    if (acType) filter.acType = acType
    if (capacity) filter.capacity = Number(capacity)

    const rooms = await Room.find(filter).sort({ block: 1, roomNumber: 1 })
    res.json({ success: true, message: 'Rooms retrieved', data: rooms })
  } catch (err) {
    next(err)
  }
}

// GET /api/roommate/rooms/:id
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) throw new ApiError(404, 'Room not found')
    res.json({ success: true, message: 'Room retrieved', data: room })
  } catch (err) {
    next(err)
  }
}

// POST /api/roommate/rooms — admin create room
export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, block, floor, acType, roomPosition, capacity } = req.body
    if (!roomNumber || !block || !acType || !capacity) {
      throw new ApiError(400, 'roomNumber, block, acType, and capacity are required')
    }

    const existing = await Room.findOne({ roomNumber, block })
    if (existing) throw new ApiError(409, 'A room with this number already exists in this block')

    const room = await Room.create({
      roomNumber, block, floor, acType, roomPosition,
      capacity: Number(capacity),
      availabilityStatus: 'AVAILABLE',
      occupancyCount: 0,
    })

    res.status(201).json({ success: true, message: 'Room created', data: room })
  } catch (err) {
    next(err)
  }
}

// PUT /api/roommate/rooms/:id — admin update room
export const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!room) throw new ApiError(404, 'Room not found')
    res.json({ success: true, message: 'Room updated', data: room })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/roommate/rooms/:id/status — admin update availability
export const updateRoomStatus = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body
    if (!availabilityStatus) throw new ApiError(400, 'availabilityStatus is required')

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { availabilityStatus },
      { new: true }
    )
    if (!room) throw new ApiError(404, 'Room not found')
    res.json({ success: true, message: 'Room status updated', data: room })
  } catch (err) {
    next(err)
  }
}

// POST /api/roommate/rooms/:id/assign — admin assign student to room
export const assignStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body
    if (!studentId) throw new ApiError(400, 'studentId is required')

    const room = await Room.findById(req.params.id)
    if (!room) throw new ApiError(404, 'Room not found')

    const profile = await StudentProfile.findById(studentId)
    if (!profile) throw new ApiError(404, 'Student profile not found')

    // Update student profile with room
    profile.roomId = room._id
    await profile.save()

    // Bump occupancy count
    room.occupancyCount = Math.min((room.occupancyCount || 0) + 1, room.capacity)
    if (room.occupancyCount >= room.capacity) room.availabilityStatus = 'FULL'
    else room.availabilityStatus = 'PARTIALLY_FILLED'
    await room.save()

    res.json({ success: true, message: 'Student assigned to room', data: { room, profile } })
  } catch (err) {
    next(err)
  }
}
