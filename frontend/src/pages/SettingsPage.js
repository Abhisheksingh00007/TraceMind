import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Activity, Save, Database, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BASE_URL = process.env.REACT_APP_API_URL || "https://abhisheksingh007-tracemind.hf.space";

export const SettingsPage = ({ userName, userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    dob: '', 
    gender: 'male',
    height: 170,
    weight: 65
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem('tracemind_prefs');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setPreferences({ ...preferences, [e.target.name]: value });
  };

  const handleSave = async () => {
    const h = parseInt(preferences.height);
    const w = parseInt(preferences.weight);

    if (h < 50 || h > 300) {
      toast.error('Height must be between 50 cm and 300 cm.');
      return;
    }
    if (w < 20 || w > 500) {
      toast.error('Weight must be between 20 kg and 500 kg.');
      return;
    }

    setLoading(true);
    const prefsToSave = {
      ...preferences,
      savedYear: new Date().getFullYear() 
    };
    
    localStorage.setItem('tracemind_prefs', JSON.stringify(prefsToSave));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/update-settings`, prefsToSave, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        toast.success('Preferences successfully synced to Cloud!', {
          style: { borderRadius: '100px', background: '#022c22', color: '#34d399', border: '1px solid #064e3b' }
        });
      }
    } catch (err) {
      console.error("Cloud Sync Error", err);
      toast.error('Local save complete, but Cloud sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm("WARNING: This will permanently delete your TraceMind account and all your historical data. This action CANNOT be undone. Are you absolutely sure?");
    
    if (!isConfirmed) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${BASE_URL}/delete-account`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        toast.success("Account permanently deleted.", { icon: '💥' });
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Failed to delete account. Try again later.");
      }
    } catch (error) {
      console.error("Delete Error", error);
      toast.error("Server Error. Could not process deletion.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8 pb-12 pt-4 px-2">
      
      <div className="border-b border-slate-800/80 pb-6 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">System Preferences</h2>
        <p className="text-slate-400 text-sm font-medium mt-2">Manage your neural core settings and bio-sync defaults.</p>
      </div>

      <div className="space-y-6">
        
        <div className="bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-cyan-900/30 ring-4 ring-slate-950 flex-shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">{userName}</h3>
              <p className="text-sm text-slate-400 mt-1 font-medium">{userEmail}</p>
            </div>
          </div>
          
          <div className="flex flex-row gap-4 w-full md:w-auto justify-center md:justify-end border-t border-slate-800/80 md:border-t-0 pt-4 md:pt-0">
            <div className="flex flex-col items-center bg-slate-950/50 px-5 py-3 rounded-2xl border border-slate-800/50 min-w-[120px]">
              <span className="flex items-center text-slate-400 font-medium text-xs mb-2"><Shield size={14} className="mr-2 text-emerald-500" /> Status</span>
              <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-md">Verified</span>
            </div>
            <div className="flex flex-col items-center bg-slate-950/50 px-5 py-3 rounded-2xl border border-slate-800/50 min-w-[120px]">
              <span className="flex items-center text-slate-400 font-medium text-xs mb-2"><Database size={14} className="mr-2 text-cyan-500" /> Cloud</span>
              <span className="text-cyan-400 font-black uppercase tracking-widest text-[10px] bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-md">Active</span>
            </div>
          </div>

        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-8 md:p-10 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
          <div className="mb-8 border-b border-slate-800/80 pb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center">
              <Activity className="mr-3 text-cyan-500" size={20}/> Default Physical Profile
            </h3>
            <p className="text-sm text-slate-200 mt-2 font-medium">Save your default metrics so you don't have to enter them every time you start a new assessment.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
            <div>
              <label className="text-[10px] font-bold text-slate-200 uppercase ml-5 mb-2.5 block tracking-widest">Date of Birth</label>
              <input 
                type={preferences.dob ? "date" : "text"} 
                name="dob" 
                value={preferences.dob} 
                onChange={handleChange} 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                placeholder="MM/DD/YYYY"
                className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-4 px-6 focus:border-cyan-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 font-medium [color-scheme:dark] shadow-inner placeholder-slate-500" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-200 uppercase ml-5 mb-2.5 block tracking-widest">Gender</label>
              <select name="gender" value={preferences.gender} onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-4 px-6 focus:border-cyan-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 appearance-none font-medium shadow-inner">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-200 uppercase ml-5 mb-2.5 block tracking-widest">Height (cm)</label>
              <input type="number" name="height" value={preferences.height} onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-4 px-6 focus:border-cyan-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 font-medium shadow-inner" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-200 uppercase ml-5 mb-2.5 block tracking-widest">Weight (kg)</label>
              <input type="number" name="weight" value={preferences.weight} onChange={handleChange} className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-4 px-6 focus:border-cyan-500 outline-none transition-all focus:ring-2 focus:ring-cyan-500/20 font-medium shadow-inner" />
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-end pt-2 mb-10">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95 border-b-4 border-cyan-800 tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" size={20} />} 
            {loading ? 'SYNCING...' : 'SAVE PREFERENCES'}
          </button>
        </div>


        <div className="mt-12 border-t border-rose-900/50 pt-10">
          <div className="bg-rose-950/20 border border-rose-900/50 p-8 rounded-[2.5rem]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-base font-bold text-rose-500 mb-1.5 flex items-center"><AlertTriangle size={18} className="mr-3 text-rose-500"/> Danger Zone</h4>
                <p className="text-sm text-slate-400 font-medium">Permanently delete your account and wipe all encrypted data from the cloud.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full md:w-auto px-6 py-3 bg-rose-950 hover:bg-rose-900 text-rose-400 hover:text-white font-bold rounded-full transition-all flex items-center justify-center border border-rose-900/80 tracking-wider text-xs whitespace-nowrap"
              >
                {deleteLoading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Trash2 className="mr-2" size={16}/>}
                {deleteLoading ? 'ERASING...' : 'DELETE ACCOUNT'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};