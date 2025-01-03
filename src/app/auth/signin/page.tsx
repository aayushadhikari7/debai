"use client";

import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#708090] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.png')] opacity-50 animate-twinkle"></div>
      <div className="max-w-md w-full space-y-8 p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 hover:border-white/30 transition-all duration-300">
        <div className="relative">
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
            <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
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
