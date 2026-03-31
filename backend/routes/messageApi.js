import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getAllUsers, getMessages, getUsersForSidebar, sendMessage } from '../controllers/messageController.js';

const router = express.Router();

router.get('/users/sidebar', verifyToken, getUsersForSidebar);

router.get('/users/all', verifyToken, getAllUsers);

router.get('/:id', verifyToken, getMessages);

router.post('/send/:id', verifyToken, sendMessage);

export default router;