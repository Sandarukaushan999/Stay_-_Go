import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../../config/env.js'

// Ensure upload dir exists
const uploadDir = env.UPLOAD_DIR || 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`)
  },
})

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new ApiError(400, 'Invalid file type. Only JPEG and PNG are allowed.'))
    }
  },
})
