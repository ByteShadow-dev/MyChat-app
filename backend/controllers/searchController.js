import User from '../models/User.js';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const loggedInUserId = req.user._id;

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "Search query is required" });
        }

        const users = await User.find({
            _id: { $ne: loggedInUserId },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
            ]
        }).select("-password");

        res.status(200).json(users);

    } catch (error) {
        console.log("Error in searchUsers controller: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}