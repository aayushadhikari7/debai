"use client";

import { signOut } from 'next-auth/react';
import { FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOut() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    router.push('/');
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
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Sign out from your account
          </h2>
          <p className={`mt-2 text-center text-sm ${
            isDarkMode ? 'text-gray-200' : 'text-gray-600'
          }`}>
            Are you sure you want to sign out?
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <FaSignOutAlt className="w-5 h-5 mr-2" />
            Confirm Sign Out
          </button>
          <button
            onClick={() => router.push('/')}
            className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md ${
              isDarkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
