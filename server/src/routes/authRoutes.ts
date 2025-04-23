import { Router } from 'express';
import { googleAuth, googleCallback, verifyToken } from '../controllers/authController';

export const authRouter = Router();

// Google OAuth2 routes
authRouter.get('/google', googleAuth);
authRouter.get('/google/callback', googleCallback);
authRouter.post('/verify', verifyToken);
