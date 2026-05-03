import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export const InfoModal = ({ type, onClose }) => {
  if (!type) return null;

  let content = { title: '', body: '' };
  
  if (type === 'Privacy Policy') {
    content = { 
      title: 'Privacy Policy', 
      body: "At TraceMind, your privacy is our highest priority.\n\n1. Zero-Knowledge Encryption: Your clinical narratives and bio-sync metrics are encrypted locally. We cannot read your personal data.\n2. Data Usage: Your data is solely used to generate your mental health risk assessment.\n3. Third-Parties: We never sell or share your biometric or psychological data with third-party advertisers.\n\nBy using TraceMind, you consent to our secure data handling protocols." 
    };
  } else if (type === 'Terms of Service') {
    content = { 
      title: 'Terms of Service', 
      body: "Welcome to TraceMind.\n\n1. Not Medical Advice: TraceMind is an AI-powered early detection system. It does NOT replace professional medical advice, diagnosis, or treatment.\n2. Accuracy: While we use advanced Machine Learning, AI can make mistakes. Always consult a healthcare professional for serious concerns.\n3. Emergency: If you are experiencing a mental health emergency, please contact your local emergency services immediately." 
    };
  } else if (type === 'Contact') {
    content = { 
      title: 'Contact TraceMind', 
      body: "Need assistance with the system?\n\nTechnical Support:\nEmail: support@tracemind.ai\n\nBusiness Inquiries:\nEmail: hello@tracemind.ai\n\nOur neural engineering team aims to respond to all inquiries within 24-48 hours." 
    };
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()} 
        className="bg-[#0b1121] border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{content.title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors outline-none">
            <X size={24} />
          </button>
        </div>
        <div className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
          {content.body}
        </div>
        <div className="mt-8 flex justify-end border-t border-slate-800/80 pt-6">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
          >
            Acknowledge
          </button>
        </div>
      </motion.div>
    </div>
  );
};