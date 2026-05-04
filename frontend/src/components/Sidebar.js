import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Plus, History, Settings, BarChart2 } from 'lucide-react';

export const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, setPage, resetForm, page }) => {

  const handleNavigation = (targetPage) => {
    setPage(targetPage);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewAssessment = () => {
    setPage('input');
    resetForm();
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-screen bg-[#020617] border-r border-slate-800/60 flex flex-col flex-shrink-0 overflow-hidden sticky top-0 z-30"
        >
          <div className="p-4 flex items-center justify-between">
            <div onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-800/50 cursor-pointer text-slate-400 hover:text-white transition-colors">
              <Menu size={24} />
            </div>
          </div>

          <div className="px-4 mt-4">
            <button 
              onClick={handleNewAssessment}
              className="w-full flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-2xl font-bold transition-colors shadow-lg active:scale-95"
            >
              <Plus size={20} />
              <span>New Assessment</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-4 px-2">Main Menu</p>
            
            <div 
              onClick={() => handleNavigation('history')}
              className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all ${
                page === 'history' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <History size={20} />
              <span className="font-bold tracking-wide">Past Records</span>
            </div>

            <div 
              onClick={() => handleNavigation('analytics')}
              className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all ${
                page === 'analytics' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <BarChart2 size={20} />
              <span className="font-bold tracking-wide">Health Trends</span>
            </div>
            
            <div 
              onClick={() => handleNavigation('settings')}
              className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all ${
                page === 'settings' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Settings size={20} />
              <span className="font-bold tracking-wide">Settings</span>
            </div>
          </div>
          
          <div className="p-4 mt-auto">
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
