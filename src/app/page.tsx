'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState<'login' | 'signup' | null>(null);

  const handleNavigate = (type: 'login' | 'signup') => {
    router.push(`/${type}`);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background animation */}
      <div className="absolute w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-30 z-0 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 px-6 py-12 flex flex-col justify-center items-center text-center gap-8">
        <motion.h1
          className="text-5xl font-extrabold"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Connect Seamlessly with Our Chat App
        </motion.h1>

        <motion.p
          className="text-gray-300 text-lg max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Experience blazing-fast messaging, media sharing, and real-time communication — all in one platform.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex gap-6 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            variant="outline"
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => handleNavigate('login')}
          >
            Login
          </Button>
          <Button
            variant="default"
            className="bg-gray-800 border border-white text-white hover:bg-gray-700"
            onClick={() => handleNavigate('signup')}
          >
            Signup
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-400 z-10">
        © {new Date().getFullYear()} ChatApp. Built with ❤️
      </footer>
    </div>
  );
}
