import React from 'react';
import { Mail, Key, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const LoginForm = ({ 
  formData, 
  handleChange, 
  handleAuth, 
  loading, 
  showPassword, 
  setShowPassword, 
  setView, 
  handleGoogleAuth 
}) => {
  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={20} />
        <input 
          type="email" name="email" placeholder="Email Address" 
          value={formData.email} onChange={handleChange} required
          className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-3 pl-16 pr-6 focus:border-cyan-500 outline-none transition-all shadow-inner"
        />
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={20} />
          <input 
            type={showPassword ? "text" : "password"} 
            name="password" placeholder="Password" 
            value={formData.password} onChange={handleChange} required
            className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-3 pl-16 pr-14 focus:border-cyan-500 outline-none transition-all shadow-inner"
          />
          <button 
            type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 hover:text-cyan-400"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="flex justify-end px-2">
          <button 
            type="button" 
            onClick={() => setView('forgot')} 
            className="text-xs font-bold text-slate-200 hover:text-cyan-400"
          >
            Forgot Password?
          </button>
        </div>
      </div>

      <button 
        type="submit" disabled={loading}
        className="w-full py-4 mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg transition-all flex justify-center items-center text-lg active:scale-95 border-b-4 border-cyan-800"
      >
        {loading ? <Loader2 className="animate-spin" /> : (
          <>SIGN IN <ArrowRight className="ml-2" size={20}/></>
        )}
      </button>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink-0 mx-4 text-slate-200 text-xs font-bold uppercase tracking-widest">Or Access Via</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleAuth}
            onError={() => toast.error("Google Auth Window Closed or Failed")}
            theme="filled_black"
            shape="pill"
            text="signin_with"
            size="large"
            width="100%"
          />
        </GoogleOAuthProvider>
      </div>
    </form>
  );
};