import React from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export const ResetForm = ({ 
  formData, 
  handleChange, 
  handleResetPassword, 
  loading, 
  showPassword, 
  setShowPassword 
}) => {
  return (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="relative">
        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={20} />
        <input 
          type={showPassword ? "text" : "password"} 
          name="password" placeholder="New Secure Password" 
          value={formData.password} onChange={handleChange} required
          className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-4 pl-16 pr-14 focus:border-cyan-500 outline-none transition-all shadow-inner"
        />
        <button 
          type="button" onClick={() => setShowPassword(!showPassword)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 hover:text-cyan-400"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <button 
        type="submit" disabled={loading}
        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-full shadow-lg transition-all flex justify-center items-center text-lg active:scale-95 border-b-4 border-emerald-800"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'UPDATE PASSWORD'}
      </button>
    </form>
  );
};