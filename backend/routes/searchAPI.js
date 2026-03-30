import express from 'express';
import { searchUsers } from '../controllers/searchController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/search', verifyToken, searchUsers);

export default router;