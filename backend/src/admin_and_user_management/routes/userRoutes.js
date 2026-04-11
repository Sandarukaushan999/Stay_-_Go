import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import * as userController from '../controllers/userController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

const uploadDir = path.resolve('uploads/profiles')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueName + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowedTypes = /jpeg|jpg|png/
    const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeOk = allowedTypes.test(file.mimetype)
    if (extOk && mimeOk) {
      cb(null, true)
    } else {
      cb(new Error('Only JPG and PNG images are allowed'))
    }
  },
})

export const userRouter = Router()

userRouter.use(requireAuth)
userRouter.get('/dashboard-stats', userController.getMyDashboardStats)
userRouter.get('/profile/me', userController.getMyAccountProfile)
userRouter.put('/profile/me', userController.updateMyAccountProfile)
userRouter.post('/profile/avatar', upload.single('avatar'), userController.uploadAvatar)
