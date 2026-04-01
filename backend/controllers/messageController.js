import Message from '../models/message.model.js';
import User from '../models/User.js'
import cloudinary from '../configs/cloudinary.js'
import { getReceiverSocketId, io } from "../lib/socket.js";
import { saveImageLocally } from './imageController.js';

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // 1. Fetch the users (adjust this if you have a specific 'friends' array logic)
        const loggedInUser = await User.findById(loggedInUserId);
        const users = await User.find({ 
            _id: { $in: loggedInUser.friends } 
        }).select("-password");

        // 2. Map through each user to find the latest message between you two
        const usersWithLastMessage = await Promise.all(users.map(async (user) => {
            const lastMessage = await Message.findOne({
                $or: [
                    { senderId: loggedInUserId, receiverId: user._id },
                    { senderId: user._id, receiverId: loggedInUserId }
                ]
            }).sort({ createdAt: -1 }); // Sort by newest first

            return {
                ...user.toObject(),
                // If there's a message, attach its time. If not, default to 0 so they drop to the bottom.
                lastMessageTime: lastMessage ? lastMessage.createdAt : new Date(0), 
            };
        }));

        // 3. Send the modified array back to the frontend
        res.status(200).json(usersWithLastMessage);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUsers)
    }catch(error){
        console.error("Error in getUsersForSidebar: ", error);
        res.status(500).json({ message: "Internal server error"});
    }
}

export const getMessages = async (req, res) => {
    try{
        const { id:userToChatId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:senderId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:senderId}
            ]
        })

        res.status(200).json(messages);

    }catch(error){
        console.log("Error in getMessages controller: ", error);
        res.status(500).json({ message: "Internal server error"})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            imageUrl = saveImageLocally(image, senderId.toString(), 'message');
        }

        const newMessage = new Message({ senderId, receiverId, text, image: imageUrl });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // 1. Verify the user editing is the actual sender
        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(403).json({ message: "Unauthorized to edit this message" });
        }

        // 2. Enforce the 10-minute rule (10 mins * 60 secs * 1000 ms)
        const tenMinutes = 10 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(message.createdAt).getTime();

        if (timeElapsed > tenMinutes) {
            return res.status(403).json({ message: "Messages can only be edited within 10 minutes of sending" });
        }

        // 3. Update the message
        message.text = text;
        message.isEdited = true;
        await message.save();

        // 4. Emit real-time socket event to the receiver
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited", message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.error("Error in editMessage controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // 1. Verify the user deleting is the actual sender
        if (message.senderId.toString() !== senderId.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        // 2. Enforce the 10-minute rule
        const tenMinutes = 10 * 60 * 1000;
        const timeElapsed = Date.now() - new Date(message.createdAt).getTime();

        if (timeElapsed > tenMinutes) {
            return res.status(403).json({ message: "Messages can only be deleted within 10 minutes of sending" });
        }

        // 3. Delete from database
        await Message.findByIdAndDelete(messageId);

        // Optional: If you want to delete the physical image file from your local storage too, 
        // you would add a helper function here (e.g., deleteImageLocally(message.image))

        // 4. Emit real-time socket event to receiver so it disappears from their screen
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", messageId);
        }

        res.status(200).json({ message: "Message deleted successfully", messageId });
    } catch (error) {
        console.error("Error in deleteMessage controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};