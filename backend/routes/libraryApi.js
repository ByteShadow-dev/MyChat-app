import express from "express";
import { forgotPassword, login, logout, resetPassword, signup, verifyEmail, checkAuth, updateProfile, updateProfileLocal, getUserById, getFriends, sendFriendRequest, acceptFriendRequest, ignoreFriendRequest, removeFriend, changeAccountPrivacy } from "../controllers/userControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { getAllUsers } from "../controllers/messageController.js";

const router = express.Router();

router.get('/', verifyToken)

router.post('/:id', verifyToken)

router.delete('installed/:id', verifyToken)

router.post('installed/:id', verifyToken)

router.delete('installed/:id', verifyToken)

export default router;