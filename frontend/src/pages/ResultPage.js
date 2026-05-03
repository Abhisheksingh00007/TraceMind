import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Download, AlertTriangle, ShieldCheck, FileText, Brain, HeartPulse, CheckCircle2, RefreshCcw, Loader2, Phone, ChevronDown, ChevronUp, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ResultPage = ({ result, setPage }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSOS, setShowSOS] = useState(false);

  if (!result) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('report-content');
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#020617', 
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TraceMind_Report_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF Export Error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTheme = () => {
    if (result.risk_level === 'HIGH') return { 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/30', 
      glow: 'shadow-[0_0_40px_rgba(244,63,94,0.3)]', 
      icon: <AlertTriangle size={70} className="text-rose-500 animate-pulse" /> 
    };
    if (result.risk_level === 'MODERATE') return { 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30', 
      glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]', 
      icon: <Activity size={70} className="text-amber-500 animate-pulse" /> 
    };
    return { 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30', 
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]', 
      icon: <ShieldCheck size={70} className="text-emerald-500" /> 
    };
  };

  const theme = getTheme();
  const isInsufficient = result.nlp_detection?.toLowerCase().includes("insufficient");
  const cleanNlpStatus = result.nlp_detection ? result.nlp_detection.split('(')[0].trim() : 'Analyzed';

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8 px-2">
        <button 
          onClick={() => setPage('input')} 
          className="flex items-center text-slate-400 hover:text-cyan-400 transition-all font-bold uppercase tracking-wider text-xs group"
        >
          <RefreshCcw size={16} className="mr-2 group-hover:-rotate-90 transition-transform duration-300" /> 
          New Assessment
        </button>
        <button 
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
          {isExporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      <div id="report-content" className="w-full bg-slate-950 p-8 md:p-14 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className={`absolute top-[-20%] left-[50%] translate-x-[-50%] w-96 h-96 blur-[120px] rounded-full pointer-events-none ${theme.bg}`}></div>

        <div className="flex justify-between items-start border-b border-slate-800/80 pb-6 mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-950/50 rounded-2xl border border-cyan-900/50">
              <Brain className="text-cyan-500" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">TraceMind Report</h1>
              <p className="text-slate-200 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Encrypted Neural Telemetry</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Date Generated</p>
            <p className="text-slate-200 text-sm font-medium">{new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center mb-16 relative z-10">
          <div className={`p-8 rounded-[2.5rem] ${theme.bg} ${theme.border} border mb-6 ${theme.glow}`}>
            {theme.icon}
          </div>
          <p className="text-slate-200 font-black uppercase tracking-[0.4em] text-xs mb-3">Detected Risk Profile</p>
          <h2 className={`text-6xl md:text-7xl font-black uppercase tracking-tighter ${theme.color}`}>
            {result.risk_level}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-inner">
            <p className="flex items-center text-slate-200 text-[10px] font-black uppercase tracking-widest mb-3">
              {isInsufficient ? <Info size={14} className="mr-2 text-slate-400" /> : <FileText size={14} className="mr-2 text-cyan-500" />} AI Sentiment
            </p>
            <p className={`${isInsufficient ? 'text-sm text-slate-400' : 'text-lg text-white'} font-bold leading-tight uppercase`}>
              {cleanNlpStatus}
            </p>
          </div>
          
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-inner">
            <p className="flex items-center text-slate-200 text-[10px] font-black uppercase tracking-widest mb-3">
              <Activity size={14} className="mr-2 text-purple-500" /> Indicators
            </p>
            <p className="text-2xl font-black text-white">{result.symptoms_analyzed} <span className="text-xs font-bold text-slate-200 uppercase tracking-widest ml-1">Factors</span></p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-inner">
            <p className="flex items-center text-slate-200 text-[10px] font-black uppercase tracking-widest mb-3">
              <HeartPulse size={14} className="mr-2 text-rose-500" /> BMI Metric
            </p>
            <p className="text-2xl font-black text-white">{result.bmi} <span className="text-xs font-bold text-slate-200 uppercase tracking-widest ml-1">kg/m²</span></p>
          </div>
        </div>

        <div className="relative z-10 bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
            <ShieldCheck className="mr-3 text-cyan-500" size={18} /> Clinical Recommendations
          </h3>
          <div className="space-y-4">
            {result.suggestions && result.suggestions.map((suggestion, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="flex items-start gap-4"
              >
                <div className="mt-1">
                  <CheckCircle2 size={18} className={`${theme.color}`} />
                </div>
                <p className="text-slate-300 font-medium leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div data-html2canvas-ignore="true" className="mt-6 bg-rose-950/20 border border-rose-900/50 rounded-3xl p-6 md:p-8 shadow-sm relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-full">
                <Phone size={24} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-500 uppercase tracking-widest">Crisis Support</h3>
                <p className="text-slate-400 text-sm font-medium">Immediate help is available 24/7. You are not alone.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSOS(!showSOS)}
              className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {showSOS ? "Hide Helplines" : "Show Helplines"}
              {showSOS ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {showSOS && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }} 
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-[#0b1121] border border-slate-800 rounded-2xl flex flex-col justify-between transition-all hover:border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div>
                      <h4 className="font-bold text-white">KIRAN (Govt.)</h4>
                      <p className="text-xs text-slate-200 mt-1 font-medium">National Mental Health Helpline</p>
                    </div>
                    <a href="tel:18005990019" className="mt-5 py-2.5 w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-center font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      <Phone size={14} /> 1800-599-0019
                    </a>
                  </div>

                  <div className="p-5 bg-[#0b1121] border border-slate-800 rounded-2xl flex flex-col justify-between transition-all hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div>
                      <h4 className="font-bold text-white">AASRA</h4>
                      <p className="text-xs text-slate-200 mt-1 font-medium">Crisis Intervention Center</p>
                    </div>
                    <a href="tel:9820466726" className="mt-5 py-2.5 w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-center font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      <Phone size={14} /> 9820466726
                    </a>
                  </div>

                  <div className="p-5 bg-[#0b1121] border border-slate-800 rounded-2xl flex flex-col justify-between transition-all hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <div>
                      <h4 className="font-bold text-white">Vandrevala</h4>
                      <p className="text-xs text-slate-200 mt-1 font-medium">Free Psychological Counseling</p>
                    </div>
                    <a href="tel:9999666555" className="mt-5 py-2.5 w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-center font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      <Phone size={14} /> 9999666555
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 pt-6 border-t border-slate-800/80 text-center opacity-40">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
            Generated by TraceMind AI Engine
          </p>
          <p className="text-[8px] font-medium text-slate-200 italic">
            Highly Confidential Medical Record. AI models may occasionally produce inaccurate predictions.
          </p>
        </div>
      </div>
    </div>
  );
};