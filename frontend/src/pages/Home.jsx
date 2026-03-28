import React from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BubblesIcon, MessageCircleIcon, UserIcon } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <div>
      <Navbar/>
      <div className='flex min-h-screen justify-center items-center'>
        <div className='flex flex-col justify-center items-center w-md bg-base-300/80 rounded-4xl shadow-lg gap-10 pt-30 pb-30'>
          <h1 className='text-2xl font-mono'>Hello, {user.name}!</h1>
          <h1 className='text-3xl font-light'>Welcome to ChatRooms</h1>
          <button data-theme='forest' className='btn btn-primary font-mono' onClick={() => navigate('/chats')}>
            <MessageCircleIcon/>
            Start chatting
          </button>

          <button data-theme='forest' className='btn btn-outline font-mono' onClick={() => navigate('/search')}>
            <UserIcon/>
            Search Users
          </button>
          
        </div>
      </div>
    </div>
  )
}

export default Home