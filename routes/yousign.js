// routes/yousign.js
import express from 'express';
import { checkSignatureStatus, sendContractForSigning } from '../controllers/YousignController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/send-contract', sendContractForSigning,verifyToken(["admin"]));
router.get('/checkSignatureStatus/:signatureRequestId', checkSignatureStatus,verifyToken);

export default router;
