import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, Calendar, AlertTriangle, CheckCircle2, ShieldAlert, History, Download, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = process.env.REACT_APP_API_URL || "https://abhisheksingh007-tracemind.hf.space";

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setHistory(response.data.data);
      } else {
        toast.error("Failed to load records.");
      }
    } catch (err) {
      toast.error("Error fetching record from server.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    const d = new Date(timestamp);
    const datePart = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${datePart} • ${timePart}`;
  };

  const downloadPDF = () => {
    if (history.length === 0) {
      toast.error("No records available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(6, 182, 212); 
    doc.text('TraceMind', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text('Neural Assessment History Report', 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 14, 35);

    const tableColumn = ["Date", "Risk Level", "AI Sentiment", "PHQ-9", "GAD-7", "BPM", "Sleep"];
    const tableRows = history.map(record => [
      new Date(record.timestamp).toLocaleDateString('en-GB'),
      record.detected_risk_level || 'N/A',
      record.nlp_analysis?.split('(')[0].trim() || 'Analyzed',
      record.phq9_score?.toString() || '0',
      record.gad7_score?.toString() || '0',
      record.heart_rate?.toString() || 'N/A',
      `${record.sleep_hours || 0}h`
    ]);

    autoTable(doc, {
      startY: 45,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [241, 245, 249] }
    });

    doc.save(`TraceMind_Vault_${new Date().getTime()}.pdf`);
    toast.success("PDF Downloaded Successfully!");
  };

  const getRiskStyles = (level) => {
    if (level === 'HIGH') return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: <ShieldAlert size={14} className="mr-2" /> };
    if (level === 'MODERATE') return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: <AlertTriangle size={14} className="mr-2" /> };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <CheckCircle2 size={14} className="mr-2" /> };
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-200 font-bold uppercase tracking-[0.2em] text-xs">Loading Your Records...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-12 pt-4 px-2">
      <div className="flex flex-col md:flex-row justify-between md:items-end border-b border-slate-800/80 pb-6 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">Past Records</h2>
          <p className="text-slate-200 text-sm font-medium mt-1">Your previous assessments, securely stored in one place.</p>
        </div>
        <button 
          onClick={downloadPDF}
          disabled={history.length === 0}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg active:scale-95"
        >
          <Download size={18} /> Download Records
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-[2.5rem] p-16 text-center backdrop-blur-sm flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mb-6 border border-slate-800">
            <History size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">No Traces Found</h3>
          <p className="text-slate-200 text-sm max-w-xs mt-2">Initialize an assessment to start tracking your neural patterns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record, index) => {
            const styles = getRiskStyles(record.detected_risk_level);
            const isInsufficient = record.nlp_analysis?.toLowerCase().includes("insufficient");
            const cleanNlp = record.nlp_analysis?.split('(')[0].trim() || 'Analyzed';

            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={index} 
                className="group bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-[2rem] hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5 border-b border-slate-800/50 pb-5">
                  <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Calendar size={14} className="mr-3 text-cyan-500" />
                    {formatDateTime(record.timestamp)}
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border flex items-center text-[10px] font-black uppercase tracking-[0.15em] ${styles.bg} ${styles.color} ${styles.border}`}>
                    {styles.icon} {record.detected_risk_level} RISK
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/50">
                  <p className="text-slate-300 italic text-sm mb-5 leading-relaxed font-medium">"{record.clinical_narrative}"</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="text-[10px] font-bold text-slate-200 uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      PHQ-9: <span className="text-white ml-1">{record.phq9_score}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-200 uppercase tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      GAD-7: <span className="text-white ml-1">{record.gad7_score}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                      {isInsufficient ? <Info size={10} className="mr-2 text-slate-200" /> : <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />}
                      <span className={isInsufficient ? 'text-slate-200' : 'text-cyan-400'}>{cleanNlp}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
