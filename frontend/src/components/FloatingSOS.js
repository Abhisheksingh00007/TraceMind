import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertCircle, HeartHandshake } from 'lucide-react';

export const FloatingSOS = () => {
  const [isOpen, setIsOpen] = useState(false);

  const helplines = [
    {
      name: "KIRAN (Govt. of India)",
      number: "1800-599-0019",
      desc: "24/7 Toll-Free Mental Health Helpline",
      color: "border-blue-500/30 bg-blue-500/10 text-blue-400"
    },
    {
      name: "AASRA",
      number: "9820466726",
      desc: "24/7 Crisis Intervention Center",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
    },
    {
      name: "Vandrevala Foundation",
      number: "9999666555",
      desc: "24/7 Free Psychological Counseling",
      color: "border-amber-500/30 bg-amber-500/10 text-amber-400"
    }
  ];

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[90] w-14 h-14 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-colors border-2 border-rose-400/50"
        aria-label="SOS Emergency Support"
      >
        <Phone size={24} fill="currentColor" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0b1121] border border-rose-900/50 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-500" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                    <AlertCircle className="text-rose-500" />
                    Crisis Support
                  </h2>
                  <p className="text-slate-400 text-sm mt-1 font-medium">You are not alone. Help is available 24/7.</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors outline-none bg-slate-900"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {helplines.map((helpline, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${helpline.color} flex flex-col gap-3`}>
                    <div>
                      <h3 className="font-bold text-white text-lg">{helpline.name}</h3>
                      <p className="text-xs font-medium opacity-80 mt-0.5">{helpline.desc}</p>
                    </div>
                    <a 
                      href={`tel:${helpline.number}`}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Phone size={16} />
                      Call {helpline.number}
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-200 text-xs font-medium uppercase tracking-widest text-center">
                <HeartHandshake size={14} />
                TraceMind Cares
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};