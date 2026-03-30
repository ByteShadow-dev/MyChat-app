import express from 'express';
import { getGameById, getGamesForFeed } from '../controllers/gamesController.js';

const router = express.Router();

router.get('/:id', getGameById);

router.get('/feed', getGamesForFeed);

export default router;