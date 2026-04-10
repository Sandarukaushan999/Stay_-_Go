import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { validateBody } from '../../common/middlewares/validate.middleware.js'
import { loginSchema, registerSchema } from '../validations/authValidation.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerSchema), authController.register)
authRouter.post('/login', validateBody(loginSchema), authController.login)
authRouter.post('/verify-otp', authController.verifyOtp)
authRouter.get('/me', requireAuth, authController.me)
