import React from 'react';
import FloatingShape from "../components/FloatingShape"
import { motion } from 'framer-motion';
import { User, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';


const ForgotPassword = () => {
    
    const [cooldown, setCooldown] = useState(0);
    const { error, isLoading, forgotPassword } = useAuthStore();
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer); // cleanup
    }, [cooldown]);

    const handleForgotPassword  = async (e) => {
    e.preventDefault();
    try {
        forgotPassword(usernameOrEmail);
      
      toast.success("Password reset email sent successfully!")
      setCooldown(60);
    } catch (error) {
      console.log(error.response.data); // backend error message
    } 

  }
  const [usernameOrEmail, setUsernameOrEmail] = useState('');

  return (
    <div className="min-h-screen 
    bg-linear-to-br from gray-900 via-green-900 to to-emerald-900
    flex items-center justify-center relative overflow-hidden">
      <FloatingShape 
      color="bg-green-500" size="h-64 w-64" top="-5%" left="10%" delay={0}/>
      <FloatingShape 
      color="bg-emerald-500" size="h-48 w-48" top="70%" left="80%" delay={5}/>
      <FloatingShape 
      color="bg-lime-500" size="h-32 w-32" top="40%" left="10%" delay={2}/>
        <motion.div
        initial={{opacity: 0, y:20}}
        animate={{opacity: 1,y:0}}
        transition={{duration: 0.5}}
        className='max-w-md w-100 bg-gray-800/50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
        >
        <div className='p-8'>
            <h2 className='text-3xl font-bold mb-6 text-center bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
            Forgot Password?
            </h2>
            <form onSubmit={handleForgotPassword}>
            <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-700 bg-gray-800 w-full px-4 py-2">
                <User className="size-5 text-green-500" />
                <input
                    type="text"
                    placeholder="Username or email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="grow w-full text-white placeholder-gray-400 bg-transparent outline-none"
                />
            </label>
            
            {error && <p className='text-red-500 text-sm font-semibold mt-2'>{error}</p>}
            {cooldown > 0 ? <button type='button' disabled className="btn w-full mt-5 bg-gray-600 hover:bg-gray-400' text-white border-none">
                {`Resend in ${cooldown} seconds`}
                </button> : <button type="submit" className="btn w-full mt-5 bg-green-500 hover:bg-emerald-600 text-white border-none">
                {isLoading ? <Loader className='size-6 animate-spin'/> : "Send Reset Link"}
                </button>}     
            </form>
        </div>
        <div className='px-8 py-4 bg-gray-900/50 bg-opacity-50 flex justify-between text-sm'>
            <Link to='/signup' className='text-green-400 hover:underline'>Sign up</Link>
            <Link to='/login' className='text-green-400 hover:underline'>Log in</Link>
        </div> 
        </motion.div>
    </div>
  )
}

export default ForgotPassword