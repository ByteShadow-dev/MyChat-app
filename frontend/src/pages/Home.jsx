import React from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, Loader } from 'lucide-react';

const Home = () => {

    const navigate = useNavigate();
    const {isLoading, logout, user} = useAuthStore();
  
    const handleLogout = async () => {
      try {
        await logout();
        toast.success("Logged out successfully!");
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      }catch(error){
        console.log(error.response.data);
        toast.error("Unable to log out");
      }
    }
  

  return (
    <div>

      <div className='flex justify-between p-3 bg-base-300'>
        <HomeIcon className='size-10'/>
        {isLoading ? <button disabled className='btn btn-primary animate-spin'>
          <Loader/>
        </button> : 
        <button onClick={handleLogout} className='btn btn-primary'>
          Logout
        </button>}
      </div>
      <div className='flex items-center justify-center'>
          <div className='text-center max-w-md w-100 h-100 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
            <h1>Hello {user.name}!</h1>
            
          </div>
      </div>

    </div>
  )
}

export default Home