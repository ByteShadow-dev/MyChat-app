# Freddyboy Auth Stack & Boilerplate

> A robust, production-ready **MERN stack** boilerplate featuring secure JWT authentication, email verification, password reset flows, and a modular architecture — built to scale into any serious application.

This isn't just an auth system. It's a **foundation**. Every architectural decision here is designed so you can layer features on top without ever needing to refactor the base. Whether you're building a social media platform, a SaaS product, or a real-time chat app — start here.

---

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [How Authentication Works](#-how-authentication-works)
- [Extensibility Guide](#-extensibility-guide)
  - [Adding a New Database Model](#1-adding-a-new-database-model)
  - [Creating New API Endpoints](#2-creating-new-api-endpoints)
  - [Managing New Global State](#3-managing-new-global-state-zustand)
  - [Adding New Frontend Pages](#4-adding-new-frontend-pages)
- [Security Considerations](#-security-considerations)

---

## 🚀 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + Vite | UI framework & fast dev server |
| Tailwind CSS v4 + DaisyUI | Utility-first styling & prebuilt components |
| Zustand | Lightweight, modular global state management |
| Framer Motion | Smooth page & element animations |
| React Router DOM | Client-side routing & protected routes |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server & REST API |
| MongoDB + Mongoose | Database & schema modeling |
| JWT (HTTP-only cookies) | Secure, stateless session management |
| Bcryptjs | Password hashing |
| Nodemailer | Transactional emails (verification, reset) |

---

## ✅ Features

- **Signup** with username, name, email, and password
- **Email verification** via a 6-digit OTP code
- **Login** with either username or email
- **Logout** with cookie clearing
- **Forgot password** — sends a reset link via email
- **Reset password** — token-based, expires after use
- **Auth persistence** — `checkAuth` re-validates session on page refresh using the JWT cookie
- **Protected routes** — unauthenticated users are redirected automatically
- **Password strength meter** — real-time feedback on the frontend
- **Reveal/hide password toggle** on all password inputs

---

## 📂 Project Architecture

This project strictly follows **separation of concerns** — database logic, API logic, and frontend state never bleed into each other.

```
Freddyboy-Auth-Stack/
│
├── backend/
│   ├── configs/
│   │   └── mongodb.js          # MongoDB connection setup
│   ├── controllers/
│   │   └── authController.js   # Logic for signup, login, logout, verify, reset
│   ├── mail-service/
│   │   ├── mailer.js           # Nodemailer transporter config
│   │   └── emailTemplates.js   # HTML templates for verification & reset emails
│   ├── middleware/
│   │   └── verifyToken.js      # JWT validation — protects private routes
│   ├── models/
│   │   └── User.js             # Mongoose user schema
│   ├── routes/
│   │   └── authApi.js          # Route definitions → controller mappings
│   └── server.js               # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── FloatingShape.jsx       # Animated background blobs
        │   └── PasswordStrengthMeter.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Verify.jsx
        │   ├── ForgotPassword.jsx
        │   └── ResetPassword.jsx
        ├── store/
        │   └── authStore.js    # Zustand store — all auth state & API calls
        ├── utils/
        │   └── date.js         # Date formatting helpers
        ├── App.jsx             # Router setup & protected route logic
        └── main.jsx            # React entry point
```

---

## 🛠 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jfreddin/Freddyboy-Auth-Stack.git
cd Freddyboy-Auth-Stack
```

### 2. Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Gmail credentials for Nodemailer
GMAIL=your_gmail_address@gmail.com
PASS=your_gmail_app_password
```

> **Note on Gmail:** You need to generate an **App Password** from your Google account (not your regular password). Go to Google Account → Security → 2-Step Verification → App Passwords.

### 3. Install & Run

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

---

## 🔐 How Authentication Works

Understanding this flow is essential before extending the app.

```
1. User signs up
      ↓
2. Backend creates user in MongoDB, sends verification email
      ↓
3. User enters 6-digit OTP → backend marks isVerified: true
      ↓
4. User logs in → backend issues a JWT stored in an HTTP-only cookie
      ↓
5. Every protected request sends the cookie automatically (withCredentials: true)
      ↓
6. verifyToken middleware decodes the JWT → injects req.userId into the request
      ↓
7. On page refresh → checkAuth() hits /check-auth → re-populates Zustand store
```

### Why HTTP-only cookies?

JWT tokens stored in `localStorage` are vulnerable to XSS attacks. HTTP-only cookies **cannot be accessed by JavaScript**, making them significantly more secure for session management.

---

## 📘 Extensibility Guide

This is where the boilerplate pays off. Follow this workflow for every new feature.

---

### 1. Adding a New Database Model

When you need to store new data (posts, messages, follows), create a new Mongoose model.

**Example — `backend/models/Post.js`:**

```js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',       // Links this post back to the User model
        required: true
    },
    image:   { type: String, required: true },
    caption: { type: String, default: "" },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
}, { timestamps: true });   // Automatically adds createdAt and updatedAt

export default mongoose.model('posts', postSchema);
```

> **Rule:** Every model that belongs to a user should have a `userId` field referencing `'users'`. This is how MongoDB links documents across collections.

---

### 2. Creating New API Endpoints

Three steps: **Controller → Route → Register**.

**Step 1 — Controller (`backend/controllers/postController.js`):**

```js
import Post from '../models/Post.js';

export const createPost = async (req, res) => {
    try {
        // req.userId is injected by verifyToken middleware
        const newPost = new Post({ userId: req.userId, ...req.body });
        await newPost.save();
        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create post" });
    }
};

export const getFeed = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'username name');
        res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch feed" });
    }
};
```

**Step 2 — Route (`backend/routes/postApi.js`):**

```js
import express from 'express';
import { createPost, getFeed } from '../controllers/postController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/create', verifyToken, createPost);  // Protected
router.get('/feed',   verifyToken, getFeed);       // Protected

export default router;
```

**Step 3 — Register in `backend/server.js`:**

```js
import postRoutes from './routes/postApi.js';
app.use('/api/posts', postRoutes);
```

Your new endpoints are now live at `/api/posts/create` and `/api/posts/feed`.

---

### 3. Managing New Global State (Zustand)

**Do not put everything in `authStore.js`.** Create a dedicated store per domain.

```
store/
├── authStore.js    ← login, logout, signup, checkAuth
├── postStore.js    ← createPost, fetchFeed, likePost
├── friendStore.js  ← fetchFriends, addFriend, removeFriend
└── uiStore.js      ← modals, sidebar state, theme (optional)
```

**Example — `frontend/src/store/postStore.js`:**

```js
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/posts';

export const usePostStore = create((set) => ({
    posts: [],
    isLoading: false,
    error: null,

    fetchFeed: async () => {
        set({ isLoading: true });
        try {
            const res = await axios.get(`${API_URL}/feed`);
            set({ posts: res.data.posts, isLoading: false });
        } catch (error) {
            set({ error: "Failed to load feed", isLoading: false });
        }
    },

    createPost: async (postData) => {
        set({ isLoading: true });
        try {
            const res = await axios.post(`${API_URL}/create`, postData);
            // Prepend new post to the top of the feed
            set((state) => ({ posts: [res.data.post, ...state.posts], isLoading: false }));
        } catch (error) {
            set({ error: "Failed to create post", isLoading: false });
        }
    }
}));
```

**Using multiple stores in one component:**

```jsx
const Feed = () => {
    const { user } = useAuthStore();           // who's logged in
    const { posts, fetchFeed } = usePostStore(); // their feed

    useEffect(() => { fetchFeed() }, []);

    return (
        <div>
            {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
    );
};
```

> **Key insight:** Stores stay independent because the backend uses the JWT cookie to identify the user — your frontend stores never need to pass a user ID manually.

---

### 4. Adding New Frontend Pages

**Step 1 — Create the page (`frontend/src/pages/Profile.jsx`):**

```jsx
import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePostStore } from '../store/postStore';

const Profile = () => {
    const { user } = useAuthStore();
    const { posts, fetchFeed } = usePostStore();

    useEffect(() => { fetchFeed() }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-3xl font-bold">{user.username}'s Profile</h1>
            <p className="text-gray-400">{user.email}</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
                {posts.map(post => (
                    <img key={post._id} src={post.image} className="rounded-lg" />
                ))}
            </div>
        </div>
    );
};

export default Profile;
```

**Step 2 — Register and protect the route in `frontend/src/App.jsx`:**

```jsx
import Profile from './pages/Profile';

// Inside your <Routes>
<Route path='/profile' element={
    <ProtectedRoute>
        <Profile />
    </ProtectedRoute>
} />
```

Any route wrapped in `<ProtectedRoute>` will automatically redirect unauthenticated users to `/login`.

---

## 🔒 Security Considerations

| Concern | How it's handled |
|---|---|
| Password storage | Hashed with `bcryptjs` before saving to MongoDB — never stored in plaintext |
| Session tokens | JWT stored in HTTP-only cookies — inaccessible to JavaScript, resistant to XSS |
| Protected routes | `verifyToken` middleware validates JWT on every protected API call |
| CORS | Configured with `credentials: true` to allow cookie-based auth across origins |
| Email enumeration | Reset password endpoint responds the same way whether the email exists or not |

---

## 📄 License

MIT — free to use, modify, and build upon.