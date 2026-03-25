import React from 'react'
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { DoorOpenIcon, HomeIcon, Loader, SettingsIcon, UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = () => {
    const navigate = useNavigate();
    const {isLoading, logout, isAuthenticated} = useAuthStore();
  
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
    <div className='flex justify-between items-center p-3 bg-base-300'>
        <Link to={'/'} className='flex gap-1'>
        <HomeIcon className='size-8'/>
        <h1 className='text-2xl font-bold'>Chatrooms</h1>
        </Link>
        <div  className='flex items-center gap-2'>
            
            <button className='btn btn-ghost' onClick={()=> navigate('/settings')}>
                <SettingsIcon/>Settings
            </button>
            {isAuthenticated && <button className='btn btn-ghost' onClick={()=>navigate('/profile')}>
                <UserIcon/>Profile
            </button>}
            {isLoading ? (
                <button disabled className='btn btn-primary'>
                    <Loader className='animate-spin'/>
                </button>
            ) : (
                <button onClick={handleLogout} className='btn btn-primary'>
                    <DoorOpenIcon/>
                    Logout
                </button>
            )}
        </div>

    </div>
)
}

export default Navbar