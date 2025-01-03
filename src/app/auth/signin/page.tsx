"use client";

import { signIn } from 'next-auth/react';
import { FaGoogle, FaSun, FaMoon } from 'react-icons/fa';
import { useState } from 'react';

export default function SignIn() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
      isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${
        isDarkMode ? 'from-zinc-800 to-zinc-900' : 'from-gray-200 to-gray-100'
      } opacity-50`}></div>
      <div className={`max-w-md w-full space-y-8 p-8 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-700/50' 
          : 'bg-white/50 border border-gray-200 hover:border-gray-300'
      }`}>
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-zinc-700 hover:bg-zinc-600 text-gray-200' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
        <div className="relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
            <img src="/download.jpg" alt="Logo" className="w-24 h-24 object-contain rounded-full border-4 border-zinc-700" />
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Welcome Back
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDarkMode ? 'text-blue-200' : 'text-gray-600'
          }`}>
            Sign in to continue your journey
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FaGoogle className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
