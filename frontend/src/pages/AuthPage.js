import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ForgotForm } from '../components/auth/ForgotForm';
import { ResetForm } from '../components/auth/ResetForm';

const AuthPage = ({ onLoginSuccess }) => {
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryQuestion, setRecoveryQuestion] = useState('');
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    security_question: '', 
    security_answer: '',
    user_answer: '' 
  });

  const BASE_URL = process.env.REACT_APP_API_URL || "https://abhisheksingh007-tracemind.hf.space";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pass) => {
    let missing = [];
    if (pass.length < 8) missing.push('8+ chars');
    if (!/[A-Z]/.test(pass)) missing.push('1 Uppercase');
    if (!/[0-9]/.test(pass)) missing.push('1 Number');
    if (!/[!@#$%^&*]/.test(pass)) missing.push('1 Symbol');

    if (missing.length > 0) {
      toast.error(`Password missing: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return toast.error('Invalid email format.');
    
    if (view === 'signup') {
      if (!validatePassword(formData.password)) return;
      if (!formData.security_question || !formData.security_answer) {
        return toast.error('Security question and answer are required.');
      }
    }

    setLoading(true);
    try {
      const endpoint = view === 'login' ? '/login' : '/signup';
      const payload = view === 'login' 
        ? { email: formData.email, password: formData.password }
        : { 
            name: formData.name, 
            email: formData.email, 
            password: formData.password,
            security_question: formData.security_question,
            security_answer: formData.security_answer
          };

      const response = await axios.post(`${BASE_URL}${endpoint}`, payload);

      if (response.data.status === 'success') {
        if (view === 'login') {
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('userEmail', response.data.email);
          onLoginSuccess(response.data.name);
        } else {
          toast.success('Account Created! Please sign in.');
          setView('login');
          setFormData({ ...formData, password: '', security_answer: '' });
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error('Neural Core unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/google-login`, { token: credentialResponse.credential });
      if (response.data.status === 'success') {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userEmail', response.data.email);
        onLoginSuccess(response.data.name);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error('Google Synchronization Failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchQuestion = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes('@')) return toast.error('Enter a valid email.');
    
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/get-security-question`, { email: formData.email });
      if(response.data.status === 'success') {
        setRecoveryQuestion(response.data.question);
        setView('verify_answer');
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error('Request failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    if (!formData.user_answer) return toast.error('Please provide an answer.');
    
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/verify-security-answer`, {
        email: formData.email,
        answer: formData.user_answer
      });
      if(response.data.status === 'success') {
        toast.success('Identity Verified.');
        setView('reset');
      } else {
        toast.error('Incorrect answer. Access denied.');
      }
    } catch (err) {
      toast.error('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/reset-password-sq`, {
        email: formData.email,
        answer: formData.user_answer,
        new_password: formData.password
      });
      if(response.data.status === 'success') {
        toast.success('Password Updated! Please log in.');
        setView('login');
        setFormData({ ...formData, password: '', user_answer: '' });
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error('Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (view) {
      case 'login':
        return <LoginForm formData={formData} handleChange={handleChange} handleAuth={handleAuth} handleGoogleAuth={handleGoogleAuth} loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} setView={setView} />;
      case 'signup':
        return <SignupForm formData={formData} handleChange={handleChange} handleAuth={handleAuth} handleGoogleAuth={handleGoogleAuth} loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} />;
      case 'forgot':
        return <ForgotForm formData={formData} handleChange={handleChange} handleSendResetLink={handleFetchQuestion} loading={loading} />;
      case 'verify_answer':
        return (
          <form onSubmit={handleVerifyAnswer} className="space-y-6">
            <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 mb-2 shadow-inner">
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-2">Security Question</p>
              <p className="text-white font-medium italic">"{recoveryQuestion}"</p>
            </div>
            <input 
              type="text" name="user_answer" placeholder="Your Answer" 
              value={formData.user_answer} onChange={handleChange} required
              className="w-full bg-slate-950/80 border border-slate-800 text-white rounded-full py-4 px-6 focus:border-cyan-500 outline-none transition-all shadow-inner"
            />
            <button type="submit" disabled={loading} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full shadow-lg transition-all uppercase tracking-widest text-sm border-b-4 border-cyan-800 active:scale-95">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'VERIFY IDENTITY'}
            </button>
          </form>
        );
      case 'reset':
        return <ResetForm formData={formData} handleChange={handleChange} handleResetPassword={handleResetPassword} loading={loading} showPassword={showPassword} setShowPassword={setShowPassword} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900/60 backdrop-blur-3xl p-10 md:p-14 rounded-[3rem] border border-slate-800 shadow-2xl"
      >
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : view === 'verify_answer' ? 'Verify Identity' : 'System Recovery'}
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            {view === 'login' ? 'Enter credentials or use Google Auth.' : 
             view === 'signup' ? 'Register a new account or use Google.' : 
             view === 'forgot' ? 'Enter your email to retrieve your security question.' : 
             view === 'verify_answer' ? 'Answer your security question to proceed.' :
             'Set a new secure password for your account.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {renderForm()}
          </motion.div>
        </AnimatePresence>

        {view !== 'reset' && view !== 'verify_answer' && (
          <div className="mt-8 text-center pt-8 border-t border-slate-800/50">
            <button 
              type="button"
              onClick={() => { 
                setView(view === 'login' ? 'signup' : 'login'); 
                setFormData({name:'', email:'', password:'', security_question:'', security_answer:'', user_answer:''}); 
              }}
              className="text-slate-200 hover:text-cyan-400 text-sm font-bold uppercase tracking-wider"
            >
              {view === 'login' ? "Don't have an account? Sign up" : "Back to Login"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;