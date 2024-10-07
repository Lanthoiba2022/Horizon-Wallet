"use client";

import { useTheme } from 'next-themes';
import { Wallet, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is loaded before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent server-side mismatch

  return (
    <div className={`flex items-center justify-between p-5 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex items-center">
        <Wallet size={50} className="text-blue-500" />
        <span className="ml-2 text-lg pt-2 font-extrabold">Horizon Wallet</span>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex items-center p-2 rounded border focus:outline-none"
      >
        {theme === 'dark' ? (
          <Sun size={24} className="text-yellow-500" />
        ) : (
          <Moon size={24} className="text-gray-500" />
        )}
      </button>
    </div>
  );
};

export default Navbar;
