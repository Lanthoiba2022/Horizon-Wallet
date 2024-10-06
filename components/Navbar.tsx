"use client"

import { useState } from 'react';
import { Wallet, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  // State to manage theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div className={`flex items-center justify-between p-5 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex items-center">
        <Wallet size={50} className="text-blue-500" />
        <span className="ml-2 text-lg pt-2 font-extrabold">Horizon Wallet</span>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleTheme}
        className="flex items-center p-2 rounded border focus:outline-none"
      >
        {isDarkMode ? (
          <Sun size={24} className="text-yellow-500" />
        ) : (
          <Moon size={24} className="text-gray-500" />
        )}
      </button>
    </div>
  );
};

export default Navbar;
