import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Shield, BrainCircuit, 
  BarChart3, FileText 
} from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      
      <div className="relative flex flex-col items-center justify-center text-center mb-20 pt-8">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[350px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center space-y-7 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black text-white leading-[1.1] tracking-tight">
            Decode Today. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Protect Tomorrow.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
            TraceMind uses Machine Learning and NLP to analyze your clinical narratives and bio-sync metrics, providing early risk detection and personalized insights with zero-knowledge encryption.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 w-full sm:w-auto">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95 tracking-widest text-sm uppercase"
            >
              Start Now <ArrowRight size={18} className="ml-3" />
            </button>
          </div>

        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">Powerful Features, Real Impact</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-[2rem] hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="text-blue-400" size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-3">AI Risk Assessment</h3>
            <p className="text-slate-200 text-sm leading-relaxed">Advanced NLP and Machine Learning models detect potential mental health risks early.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-[2rem] hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-3">Secure & Private</h3>
            <p className="text-slate-200 text-sm leading-relaxed">Your data is encrypted and stored securely locally. We value your privacy above all.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-[2rem] hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="text-purple-400" size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-3">Insights & Analytics</h3>
            <p className="text-slate-200 text-sm leading-relaxed">Visualize your emotional trends and track your mental well-being over time.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-[2rem] hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText className="text-rose-400" size={24} />
            </div>
            <h3 className="text-white font-bold text-lg mb-3">Historical Logs</h3>
            <p className="text-slate-200 text-sm leading-relaxed">Keep a detailed ledger of your assessments to share with professionals if needed.</p>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default LandingPage;