import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import customLogo from '../assets/tracemind-logo.png';

export const Header = ({ 
  isAuthenticated, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  userName, 
  userEmail, 
  handleLogout,
  setPage,
  setShowLanding 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogoClick = () => {
    if (isAuthenticated) {
      setPage('input');
    } else if (setShowLanding) {
      setShowLanding(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl px-6 py-4 flex justify-between items-center transition-all relative border-b border-slate-800/60">
      <div className="flex items-center space-x-4">
        {!isSidebarOpen && isAuthenticated && (
          <div onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-slate-800/50 cursor-pointer transition-colors text-slate-400 hover:text-white">
            <Menu size={24} />
          </div>
        )}
        
        <div 
          onClick={handleLogoClick}
          className="flex items-center group cursor-pointer"
        >
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic flex items-center">
            <img 
              src={customLogo} 
              alt="TraceMind Logo" 
              className="h-9 md:h-10 w-auto mr-3 hidden md:block group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
            />
            TraceMind
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 relative">
        {isAuthenticated ? (
          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-lg shadow-lg border border-cyan-500/30 cursor-pointer hover:ring-2 hover:ring-slate-600 transition-all"
            >
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-80 bg-[#202124] rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col p-2 z-50"
                >
                  <div className="flex justify-between items-center p-3">
                    <span className="text-xs text-slate-300 font-medium truncate w-full text-center ml-6">{userEmail}</span>
                    <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center pt-2 pb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-3xl shadow-lg border-2 border-slate-800 mb-4">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h3 className="text-xl text-white font-normal mb-6">Hi, {userName}!</h3>
                  </div>

                  <div className="mt-2 bg-slate-900/40 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => { setIsProfileOpen(false); handleLogout(); }} 
                      className="w-full flex items-center px-6 py-4 transition-colors text-slate-300 hover:bg-rose-500/10 hover:text-rose-500 group"
                    >
                      <LogOut size={20} className="mr-4 group-hover:text-rose-500 transition-colors" />
                      <span className="text-sm font-medium">Sign out of TraceMind</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null} 
      </div>
    </header>
  );
};