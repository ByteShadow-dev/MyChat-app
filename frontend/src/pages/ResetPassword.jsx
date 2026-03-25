import React from 'react'
import { motion } from 'framer-motion';
import { EyeClosedIcon, EyeIcon, Loader, User } from 'lucide-react';
import { useState,  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';


const ResetPassword = () => {
    const [password, setNewPassword] = useState('');
    const { resetToken } = useParams();
    const { error, isLoading, resetPassword } = useAuthStore();
    const [revealPass, setRevealPass]= useState(false);

    const navigate = useNavigate();
    const handleForgotPassword  = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(resetToken, password);
      toast.success("Password reset successfully!")
      navigate('/');
    } catch (error) {
      console.log(error.response.data); // backend error message
    }

  }


  return (
    <div className="min-h-screen 
    bg-linear-to-br from gray-900 via-green-900 to to-emerald-900
    flex items-center justify-center relative overflow-hidden">
        <motion.div
        initial={{opacity: 0, y:20}}
        animate={{opacity: 1,y:0}}
        transition={{duration: 0.5}}
        className='max-w-md w-100 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
        >
        <div className='p-8'>
            <h2 className='text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
            Reset Password
            </h2>
            <form onSubmit={handleForgotPassword}>
            <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-700 bg-gray-800 w-full px-4 py-2">
                <User className="size-5 text-green-500" />
                <input
                    type={revealPass ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="grow w-full text-white placeholder-gray-400 bg-transparent outline-none"
                />
                <button type='button' onClick={() => setRevealPass(!revealPass)}>
                  {revealPass ? <EyeIcon className='size-5'/> : <EyeClosedIcon className='size-5'/>}
                </button>
            </label>
            <PasswordStrengthMeter password={password}/>
            {isLoading ? <button disabled className="btn w-full mt-5">
                <Loader className='animate-spin'/>
            </button> : 
            <button type="submit" className="btn w-full mt-5 bg-green-500 hover:bg-emerald-600 text-white border-none">
                Reset Password
            </button>}
            {error && <p className='text-red-500 text-sm font-semibold mt-2'>{error}</p>}
            </form>
        </div>
        </motion.div>
    </div>
  )
}

export default ResetPassword