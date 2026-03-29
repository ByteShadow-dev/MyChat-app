import express from "express";
import { forgotPassword, login, logout, resetPassword, signup, verifyEmail, checkAuth, updateProfile, updateProfileLocal, getUserById } from "../controllers/userControllers.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth)

router.post('/login', login);

router.post('/signup', signup);

router.post('/logout', logout);

router.post('/verify-email', verifyEmail);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.put('/update-profile', verifyToken, updateProfileLocal);

router.get('/user/:id', verifyToken, getUserById);

export default router;