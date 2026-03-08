import React, { useRef, useState, useEffect } from 'react'
import FloatingShape from "../components/FloatingShape"
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Verify = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const navigate = useNavigate(); // ✅ fixed - was missing ()

    const {error, isLoading, verifyEmail} = useAuthStore();

    const handleChange = (index, value) => {
        const newCode = [...code];
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            newCode[index] = value;
            setCode(newCode);
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        const verificationCode = code.join("");
        try {
            await verifyEmail(verificationCode);
            toast.success("Email verified successfully")
            navigate('/');
        } catch (error) {
            console.log(error);
        } 
    };

    useEffect(() => {
        if (code.every((digit) => digit !== "")) {
            handleVerify({ preventDefault: () => {} });
        }
    }, [code]);

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
            Verify your account
            </h2>
            <p className='text-center text-gray-300 mb-6'>Enter the 6-digit code sent to your email.</p>
            <form onSubmit={handleVerify} className='space-y-6'>
              <div className='flex justify-between gap-2'>
                {code.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type='text'
                        maxLength='6'
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none'
                    />
                ))}
              </div>
              {error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
              <button
                type="submit"
                disabled={isLoading || code.some((digit) => !digit)}
                className="btn w-full mt-5 bg-green-500 hover:bg-emerald-600 text-white border-none disabled:opacity-50"
              >
                {isLoading ? <Loader className='size-6 animate-spin mx-auto'/> : "Verify Email"}
              </button>
            </form>
        </div>
        </motion.div>
    </div>
  )
}

export default Verify