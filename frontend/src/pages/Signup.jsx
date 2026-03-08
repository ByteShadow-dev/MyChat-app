import React from 'react';
import FloatingShape from "../components/FloatingShape"
import { motion } from 'framer-motion';
import { User, Lock, Mail, Loader, EyeIcon, EyeClosedIcon } from 'lucide-react';
import { useState, } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useAuthStore } from '../store/authStore';

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const {signup, error, isLoading} = useAuthStore();
  const [revealPass, setRevealPass] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signup(username, name, email, password)
      navigate('/verify-email')
    } catch (error) {
      console.log(error.response.data); // backend error message
  }
  }


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
          <h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
            Create Account
          </h2>
          <form onSubmit={handleSignUp}>
            <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-700 bg-gray-800 w-full px-4 py-2">
              <User className="size-5 text-green-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="grow w-full text-white placeholder-gray-400 bg-transparent outline-none"
                />
            </label>
            <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-700 bg-gray-800 w-full px-4 py-2">
              <User className="size-5 text-green-500" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="grow w-full text-white placeholder-gray-400 bg-transparent outline-none"
                />
            </label>

            <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-700 bg-gray-800 w-full px-4 py-2">
              <Lock className="size-5 text-green-500" />
                <input
                  type={revealPass ? "text" : "password"} 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="grow w-full text-white placeholder-gray-400 bg-transparent outline-none"
                />
                <button type='button' onClick={() => setRevealPass(!revealPass)}>
                  {revealPass ? <EyeIcon className='size-5'/> : <EyeClosedIcon className='size-5'/>}
                </button>
            </label>

            <label className="input input-bordered flex items-center gap-2 mb-4 border-gray-700 bg-gray-800 w-full px-4 py-2">
              <Mail className="size-5 text-green-500" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="grow w-full text-white placeholder-gray-400 bg-transparent outline-none"
                />
            </label>
            {error && <p className='text-red-500 text-sm font-semibold mt-2'>{error}</p>}
            <PasswordStrengthMeter password={password}/>
            {/* Password Strength Meter */}

            <button type="submit" className="btn w-full mt-5 bg-green-500 hover:bg-emerald-600 text-white border-none">
              {isLoading ? <Loader className='size-6 animate-spin'/> : "Create account"}
            </button>
          </form>
        </div>
        <div className='px-8 py-4 bg-gray-900/50 bg-opacity-50 flex justify-center'>
          <h1 className='px-2 text-gray-300'>Already have an account?</h1>
          <Link to='/login' className='text-green-400 hover:underline'>Log in</Link>
        </div> 
      </motion.div>
    </div>
  )
}

export default Signup