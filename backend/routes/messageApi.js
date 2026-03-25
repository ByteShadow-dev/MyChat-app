import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getMessages, getUsersForSidebar, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/users', verifyToken, getUsersForSidebar);

router.get('/:id', verifyToken, getMessages);

router.post('/send/:id', verifyToken, sendMessage);

export default router;