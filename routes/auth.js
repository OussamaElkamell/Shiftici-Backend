import express from 'express';
import { login, logout } from '../controllers/auth.js';
import { verifyToken } from '../middleware/auth.js';


const router = express.Router();


router.post('/login', login,verifyToken);
router.post('/logout', logout);

export default router;
