import { Router } from 'express';
import * as twoFactorController from '../controllers/twoFactorController.js';
import { requireAuth } from '../../common/middlewares/auth.middleware.js';

export const twoFactorRouter = Router();

twoFactorRouter.use(requireAuth);

twoFactorRouter.post('/enable', twoFactorController.enable2FA);
twoFactorRouter.post('/verify-enable', twoFactorController.verifyEnable2FA);
twoFactorRouter.post('/disable', twoFactorController.disable2FA);
