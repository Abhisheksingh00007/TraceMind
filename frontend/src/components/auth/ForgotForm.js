import React from 'react';
import { Mail, Loader2 } from 'lucide-react';

export const ForgotForm = ({ 
  formData, 
  handleChange, 
  handleSendResetLink, 
  loading 
}) => {
  return (
    <form onSubmit={handleSendResetLink} className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={20} />
        <input 
          type="email" name="email" placeholder="Registered Email Address" 
          value={formData.email} onChange={handleChange} required
          className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-3 pl-16 pr-6 focus:border-cyan-500 outline-none transition-all shadow-inner"
        />
      </div>
      <button 
        type="submit" disabled={loading}
        className="w-full py-4 mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg transition-all flex justify-center items-center text-lg active:scale-95 border-b-4 border-cyan-800"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'GET SECURITY QUESTION'}
      </button>
    </form>
  );
};