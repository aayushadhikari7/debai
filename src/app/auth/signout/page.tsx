"use client";

import { signOut } from 'next-auth/react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function SignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-zinc-900 opacity-50"></div>
      <div className="max-w-md w-full space-y-8 p-8 bg-zinc-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-700/30 hover:border-zinc-700/50 transition-all duration-300">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign out from your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
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
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
