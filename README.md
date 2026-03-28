# 🚀 MERN Chat & Social Media Starter

A full-stack, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js). This project is designed not just as a messaging app, but as a modular foundation to be extended into a fully-featured social media platform.

It features real-time bidirectional communication via Socket.io, JWT-based authentication, secure email verification via Nodemailer, global state management with Zustand, and a modern, themed UI using Tailwind CSS v4 and DaisyUI.

---

## 🛠️ Tech Stack

### Frontend
- **React 19 (Vite):** Fast, modern UI development.
- **Zustand:** Lightweight global state management.
- **Tailwind CSS v4 & DaisyUI:** Utility-first styling and pre-built component themes.
- **React Router v7:** Client-side routing.
- **Socket.io-client:** Real-time event listening.

### Backend
- **Node.js & Express.js:** RESTful API architecture.
- **MongoDB & Mongoose:** NoSQL database and object data modeling.
- **Socket.io:** WebSockets for real-time messaging.
- **JSON Web Tokens (JWT):** Secure, cookie-based authentication.
- **Nodemailer:** Email service for verification and password resets.
- **Cloudinary:** Cloud storage for profile and message images.

---

## 📂 Architecture & Project Structure

The project is divided into two main directories: `frontend/` and `backend/`.

### Backend Structure (`/backend`)
| Directory | Purpose |
|---|---|
| `configs/` | Database and external API configurations (MongoDB, Cloudinary, Nodemailer) |
| `controllers/` | Core logic — functions that process requests and send responses |
| `lib/` | Utility libraries, notably the `socket.js` configuration |
| `mail-service/` | Email templates and sending logic |
| `middleware/` | Request interceptors like `verifyToken.js` |
| `models/` | Mongoose schemas (`User.js`, `message.model.js`) |
| `routes/` | API endpoints mapped to controllers (`authApi.js`, `messageApi.js`) |
| `public/` | Local storage fallback for user-uploaded assets |

### Frontend Structure (`/frontend/src`)
| Directory | Purpose |
|---|---|
| `components/` | Reusable UI elements (`Navbar.jsx`, `MessageInput.jsx`, etc.) |
| `constants/` | Static configuration data (e.g., DaisyUI theme lists) |
| `lib/` | Utility setups like the Axios instance (`axios.js`) |
| `pages/` | Full-page route components (`Home.jsx`, `Chat.jsx`, `Profile.jsx`) |
| `store/` | Zustand global state managers (`authStore.js`, `useChatStore.js`) |

---

## 🏗️ Developer Guide: Expanding to a Social Media App

This architecture is built to be modular. Follow this standard workflow to keep the code clean and maintainable.

### 1. Adding a New Database Model (e.g., Posts or Follows)

**Where to go:** `/backend/models/`
```js
// backend/models/follow.model.js
import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
    followerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    followingId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Follow", followSchema);
```

### 2. Creating the Logic (Controllers)

**Where to go:** `/backend/controllers/`
```js
// backend/controllers/followController.js
import Follow from '../models/follow.model.js';

export const followUser = async (req, res) => {
    try {
        res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
```

### 3. Exposing the API (Routes)

**Where to go:** `/backend/routes/`
```js
// backend/routes/followApi.js
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { followUser } from '../controllers/followController.js';

const router = express.Router();
router.post('/:id', verifyToken, followUser);

export default router;
```

Then mount it in `server.js`:
```js
app.use('/api/follows', followRouter);
```

### 4. Managing Frontend State (Zustand Stores)

**Where to go:** `/frontend/src/store/`
```js
// frontend/src/store/useFollowStore.js
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useFollowStore = create((set, get) => ({
    followers: [],
    isLoadingFollows: false,

    followUser: async (userId) => {
        try {
            await axiosInstance.post(`/follows/${userId}`);
            toast.success("Followed!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to follow");
        }
    }
}));
```

### 5. Building the UI (Pages & Components)

**Where to go:** `/frontend/src/pages/` or `/frontend/src/components/`
```js
// frontend/src/pages/Network.jsx
import { useFollowStore } from '../store/useFollowStore';

const Network = () => {
    const { followUser } = useFollowStore();
    return (
        <div>
            <button onClick={() => followUser('someUserId')}>Follow</button>
        </div>
    );
};
export default Network;
```

> Remember to register new pages in `/frontend/src/App.jsx`!

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- Cloudinary Account
- Gmail account (for Nodemailer App Passwords)

### 1. Clone & Install
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer
GMAIL=your_email@gmail.com
PASS=your_16_character_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Run the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The app will be running at `http://localhost:5173`.