import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Loader2, TrendingUp, Activity, Brain, Info } from 'lucide-react';

const BASE_URL = process.env.REACT_APP_API_URL || "https://abhisheksingh007-tracemind.hf.space";

export const AnalyticsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.status === 'success' && response.data.data.length > 0) {
          const formattedData = [...response.data.data].reverse().map(item => ({
            date: new Date(item.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            phq9: item.phq9_score,
            gad7: item.gad7_score
          }));
          setData(formattedData);
        }
      } catch (err) {
        console.error("Analytics Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-200 font-bold uppercase tracking-[0.2em] text-xs">Synthesizing Neural Trends...</p>
      </div>
    );
  }

  const avgPhq9 = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.phq9, 0) / data.length).toFixed(1) : 0;
  const avgGad7 = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.gad7, 0) / data.length).toFixed(1) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8 pb-12 pt-4 px-2">
      <div className="border-b border-slate-800/80 pb-6 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">Neural Analytics</h2>
        <p className="text-slate-200 text-sm font-medium mt-1">Visualizing stability and progress via encrypted telemetry.</p>
      </div>

      {data.length < 2 ? (
        <div className="bg-slate-900/30 border border-slate-800/50 p-16 rounded-[2.5rem] text-center backdrop-blur-sm flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mb-6 border border-slate-800">
            <Activity size={32} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">Dataset Incomplete</h3>
          <p className="text-slate-200 text-sm max-w-xs mt-2">Neural trend mapping requires a minimum of 2 assessments to calculate variance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 md:p-10 rounded-[2.5rem] shadow-sm backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center">
                <TrendingUp className="mr-3" size={18} /> Mental Stability Matrix
              </h3>
              <div className="flex space-x-6 text-[10px] font-black uppercase tracking-[0.15em]">
                <span className="flex items-center text-cyan-500">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div> PHQ-9 (Depression)
                </span>
                <span className="flex items-center text-purple-500">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div> GAD-7 (Anxiety)
                </span>
              </div>
            </div>
            
            <div className="h-[350px] md:h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPhq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{dy: 10, fontWeight: 700}} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 27]} 
                    tick={{fontWeight: 700}}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#020617', 
                      border: '1px solid #1e293b', 
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="phq9" 
                    name="PHQ-9" 
                    stroke="#06b6d4" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPhq)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gad7" 
                    name="GAD-7" 
                    stroke="#8b5cf6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorGad)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center space-x-6 backdrop-blur-md">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 border border-cyan-500/20">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Timeline PHQ-9 Average</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white tracking-tighter">{avgPhq9}</p>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Score</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center space-x-6 backdrop-blur-md">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 border border-purple-500/20">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Timeline GAD-7 Average</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white tracking-tighter">{avgGad7}</p>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Score</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/20 border border-slate-800/40 p-5 rounded-2xl flex items-center gap-4">
             <Info size={16} className="text-slate-200 shrink-0" />
             <p className="text-[10px] text-slate-200 font-medium leading-relaxed">
               Lower scores generally indicate higher emotional stability. These metrics are calculated based on your self-reported assessments and encrypted neural telemetry.
             </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};