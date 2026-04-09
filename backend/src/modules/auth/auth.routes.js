import { Router } from 'express'
import * as controller from './auth.controller.js'
import { validateBody } from '../../common/middlewares/validate.middleware.js'
import { loginSchema, registerSchema } from './auth.validation.js'
import { requireAuth } from '../../common/middlewares/auth.middleware.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerSchema), controller.register)
authRouter.post('/login', validateBody(loginSchema), controller.login)
authRouter.get('/me', requireAuth, controller.me)

