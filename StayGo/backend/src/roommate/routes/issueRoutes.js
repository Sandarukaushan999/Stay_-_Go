import { Router } from 'express'
import {
  createIssue,
  getMyIssues,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  addAdminComment,
} from '../controllers/issueController.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadDir = path.join(__dirname, '../../../uploads/issues')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

export const issueRouter = Router()

issueRouter.use(requireAuth)

// Student routes
issueRouter.post('/', upload.single('attachmentImage'), createIssue)
issueRouter.get('/me', getMyIssues)

// Admin routes
issueRouter.get('/', getAllIssues)
issueRouter.get('/:id', getIssueById)
issueRouter.patch('/:id/status', updateIssueStatus)
issueRouter.patch('/:id/comment', addAdminComment)
