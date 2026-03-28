import User from '../models/User.js';

import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail } from '../mail-service/emails.js';
import cloudinary from '../configs/cloudinary.js';
import crypto from "crypto";
import { saveImageLocally } from './imageController.js';


import fs from 'fs';
import path from 'path';

const saltRounds = 10;

export async function checkAuth(req, res){
    try{
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({success: true, user: {
            ...user._doc,
            password: undefined
        }});

    }catch(error){
        console.log("Error in checkAuth ", error);
        res.status(500).json({success: false, message: "Internal server error"})
    }
}

export async function signup(req, res){
    const{username, name, email, password}  = req.body;
    try{
        
        if(!email || !password || !name){
            return res.status(400).json({ message: "All fields are required"});
        }

        const emailAlreadyExists = await User.findOne({email});
        const userAlreadyExists = await User.findOne({username});

        if(userAlreadyExists ){
            return res.status(400).json({ success:false, message: "Username already exists"});
        }
        if(emailAlreadyExists){
            return res.status(400).json({ success:false, message:"Email already exists" })
        };

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const verificationToken = Math.floor (100000 + Math.random() * 900000).toString();

        const user = new User({
            username,
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000 //24 hours
        })

        const savedUser = await user.save();
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        });
        console.log("User created");
    }catch(error){
        console.error(`Error creating user in createUser controller: ${error}`);
        res.status(504).json({ message: "Error in creating user"});
    }
}

export async function login(req, res){
    const { usernameOrEmail, password } = req.body;
    try{
        const user = await User.findOne({
            $or: [
                { email: usernameOrEmail },
                { username: usernameOrEmail}
            ]
        })
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            })
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    }catch(error){
        console.error("Error in login controller");
        res.status(500).json({ message: "Internal server error"});
    }
}

export async function logout(req, res){
    try{
        res.clearCookie("token")
        res.status(200).json({ message: "Logged out successfully" })

    }catch(error){
        console.error("Error in logout controller");
        res.status(504).json({ message: "Internal server error" });
    }
}

export async function verifyEmail(req, res){
    const { code } = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            })
        }

        user.isVerified = true;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        return res.status(200).json({
            user : {
                ...user._doc,
                password: undefined,
            }
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            message: "Bad request"
        })
    }
}

export async function forgotPassword(req, res){
     const { usernameOrEmail } = req.body;
    try{
       const user = await User.findOne({ 
        $or: [
            { email: usernameOrEmail},
            { username: usernameOrEmail}
        ]
        });
       if(!user){
        return res.status(400).json({
            success: false,
            message: "Invalid credentials, email doesn't exist"
        })
       }
       
       const userEmail = user.email;

       const resetToken = crypto.randomBytes(20).toString("hex");
       const resetTokenExpiresAt = Date.now() + 60*60*1000;

       await sendPasswordResetEmail(userEmail, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

       user.resetPasswordToken = resetToken;
       user.resetPasswordExpiresAt = resetTokenExpiresAt;
       await user.save();

       res.status(200).json({
        success: true,
        message: "Password reset link sent to your email"
       });
    }catch(error){
        console.log("Error in forgotPassword controller");
        res.status(500).json({ success: false, message: error.message});
    }
}

export async function resetPassword(req, res){
        const {token} = req.params;
        const {password} = req.body;    
    try{
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        })
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid link, user not found or token expired"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        user.password = hashedPassword;
        user.resetPasswordExpiresAt = undefined;
        user.resetPasswordToken = undefined;
        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successfully!"});
            
    }catch(error){
        console.log(`Error in resetPassword controller, ${error}`);
        res.status(400).json({ success: false, message: "Failed to reset password"})
    }
}

export const updateProfile = async (req, res) => {
    try{
        const { profilePic } = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({ message: "Profile picture is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json(updatedUser)
        
    }catch(error){
        console.log("Error in updateProfile controller: ", error);
        res.status(500).json("Internal server error");    
    }
}

export const updateProfileLocalOld = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Create folder public/userId if it doesn't exist
        const userFolder = path.join('public', userId.toString());
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        // Strip the base64 header (e.g. "data:image/png;base64,") and get extension
        const matches = profilePic.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ message: "Invalid image format" });
        }

        const ext = matches[1];        // e.g. "png", "jpg"
        const base64Data = matches[2]; // actual base64 string

        // Save file
        const filePath = path.join(userFolder, `profile.${ext}`);
        fs.writeFileSync(filePath, base64Data, 'base64');

        // Save the file path in DB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: `/${filePath}` },
            { new: true }
        );

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updateProfileLocal controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const updateProfileLocal = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        const filePath = saveImageLocally(profilePic, userId.toString(), 'profile');
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: filePath },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfileLocal: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}