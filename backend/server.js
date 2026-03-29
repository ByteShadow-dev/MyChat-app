import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';

import authRouter from './routes/authApi.js';
import messageRouter from './routes/messageApi.js';

import cors from 'cors';
import { connectDB } from './configs/mongodb.js';

import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'))); 

app.use(cors({
  origin:"http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


const PORT = process.env.PORT || 5001;

app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB(process.env.MONGO_URI).then(() => {
    server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    });

    
})



