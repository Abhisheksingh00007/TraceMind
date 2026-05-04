import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast'; 
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InfoModal } from './components/InfoModal';
import AuthPage from './pages/AuthPage';
import { InputPage } from './pages/InputPage';
import { ResultPage } from './pages/ResultPage';
import LandingPage from './pages/LandingPage'; 
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage'; 
import { AnalyticsPage } from './pages/AnalyticsPage';

const calculateAge = (dobString) => {
  if (!dobString) return "";
  const birthDate = new Date(dobString);
  const today = new Date();
  let exactAge = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    exactAge--;
  }
  return exactAge;
};

const getDynamicInitialState = () => {
  let initialState = { 
    narrative: "", age: "", gender: "", heart_rate: "", 
    height: "", weight: "", sleep_hours: "", 
    phq9_score: "", gad7_score: "", symptoms: [] 
  };

  try {
    const lastAssessmentStr = localStorage.getItem('tracemind_last_assessment');
    if (lastAssessmentStr) {
      const lastData = JSON.parse(lastAssessmentStr);
      Object.keys(lastData).forEach(key => {
        if (lastData[key] !== "" && lastData[key] != null) {
          initialState[key] = lastData[key];
        }
      });
      initialState.narrative = ""; 
    }

    const savedPrefsStr = localStorage.getItem('tracemind_prefs');
    if (savedPrefsStr) {
      const prefs = JSON.parse(savedPrefsStr);
      
      if (prefs.dob) {
        initialState.age = calculateAge(prefs.dob);
      } else if (prefs.age) {
        initialState.age = prefs.age; 
      }
      
      if (prefs.gender !== "" && prefs.gender != null) initialState.gender = prefs.gender;
      if (prefs.height !== "" && prefs.height != null) initialState.height = prefs.height;
      if (prefs.weight !== "" && prefs.weight != null) initialState.weight = prefs.weight;
    }
  } catch (e) {
    console.error("State initialization error:", e);
  }

  return initialState;
};

const GlobalFooter = ({ handleFooterLink }) => (
  <footer className="w-full mt-auto border-t border-slate-800/50 text-slate-500 bg-[#020617] shrink-0">
    <div className="w-full px-4 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-sm font-medium text-center sm:text-left m-0">
        © {new Date().getFullYear()} TraceMind. All rights reserved.
      </p>
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm font-medium">
        <button 
          onClick={() => handleFooterLink('Privacy Policy')} 
          className="hover:text-cyan-400 transition-colors cursor-pointer outline-none"
        >
          Privacy Policy
        </button>
        <button 
          onClick={() => handleFooterLink('Terms of Service')} 
          className="hover:text-cyan-400 transition-colors cursor-pointer outline-none"
        >
          Terms of Service
        </button>
        <button 
          onClick={() => handleFooterLink('Contact')} 
          className="hover:text-cyan-400 transition-colors cursor-pointer outline-none"
        >
          Contact
        </button>
      </div>
    </div>
  </footer>
);

const BASE_URL = process.env.REACT_APP_API_URL || "https://abhisheksingh007-tracemind.hf.space";

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState(''); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [page, setPage] = useState('input');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState(getDynamicInitialState());
  const [cloudProfile, setCloudProfile] = useState(null);
  const [dbLastRecord, setDbLastRecord] = useState(null);

  const syncWithCloud = async (token) => {
    try {
      const profileResponse = await axios.get(`${BASE_URL}/sync-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const historyResponse = await axios.get(`${BASE_URL}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (historyResponse.data.status === 'success' && historyResponse.data.data.length > 0) {
        setDbLastRecord(historyResponse.data.data[0]); 
      }
      if (profileResponse.data.status === 'success') {
        const cloud = profileResponse.data.data;
        setCloudProfile(cloud);
        if (cloud.dob || cloud.gender || cloud.height || cloud.weight || cloud.age) {
          localStorage.setItem('tracemind_prefs', JSON.stringify({
            dob: cloud.dob, gender: cloud.gender, height: cloud.height, weight: cloud.weight, age: cloud.age 
          }));
        }
        if (cloud.heart_rate !== "" || cloud.phq9_score !== "") {
          localStorage.setItem('tracemind_last_assessment', JSON.stringify({
            heart_rate: cloud.heart_rate, sleep_hours: cloud.sleep_hours,
            phq9_score: cloud.phq9_score, gad7_score: cloud.gad7_score
          }));
        }
        setFormData(prev => ({
          ...prev,
          age: cloud.dob ? calculateAge(cloud.dob) : (cloud.age !== "" && cloud.age != null ? cloud.age : prev.age),
          gender: cloud.gender !== "" && cloud.gender != null ? cloud.gender : prev.gender,
          height: cloud.height !== "" && cloud.height != null ? cloud.height : prev.height,
          weight: cloud.weight !== "" && cloud.weight != null ? cloud.weight : prev.weight,
          heart_rate: cloud.heart_rate !== "" && cloud.heart_rate != null ? cloud.heart_rate : prev.heart_rate,
          sleep_hours: cloud.sleep_hours !== "" && cloud.sleep_hours != null ? cloud.sleep_hours : prev.sleep_hours,
          phq9_score: cloud.phq9_score !== "" && cloud.phq9_score != null ? cloud.phq9_score : prev.phq9_score,
          gad7_score: cloud.gad7_score !== "" && cloud.gad7_score != null ? cloud.gad7_score : prev.gad7_score
        }));
      }
    } catch (error) {
      console.error("Cloud Sync Failed", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    if (token) {
      setIsAuthenticated(true);
      setUserName(name);
      setUserEmail(email);
      setShowLanding(false); 
      syncWithCloud(token);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const handleLoginSuccess = (name) => {
    setIsAuthenticated(true);
    setUserName(name);
    setUserEmail(localStorage.getItem('userEmail'));
    const token = localStorage.getItem('token');
    syncWithCloud(token);
    setPage('input');
    toast.success(`Welcome back, ${name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('tracemind_prefs'); 
    localStorage.removeItem('tracemind_last_assessment');
    setIsAuthenticated(false);
    setShowLanding(true);
    setPage('input');
    setFormData(getDynamicInitialState()); 
    setCloudProfile(null); 
    setDbLastRecord(null);
    toast('Session Terminated', { icon: '🔒' });
  };

  const executeAnalysis = async () => {
    let missingFields = [];
    if (!formData.age) missingFields.push('Age');
    if (!formData.gender) missingFields.push('Gender');
    if (!formData.height) missingFields.push('Height');
    if (!formData.weight) missingFields.push('Weight');
    if (!formData.heart_rate) missingFields.push('BPM');
    if (formData.sleep_hours === "" || formData.sleep_hours == null) missingFields.push('Sleep');
    if (formData.phq9_score === "" || formData.phq9_score == null) missingFields.push('PHQ-9');
    if (formData.gad7_score === "" || formData.gad7_score == null) missingFields.push('GAD-7');

    if (missingFields.length > 0) {
      toast.error(`Please fill required metrics: ${missingFields.join(', ')}`, {
        style: { borderRadius: '100px', background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' }
      });
      return;
    }

    let invalidRanges = [];
    const phq9 = Number(formData.phq9_score);
    const gad7 = Number(formData.gad7_score);
    const age = Number(formData.age);
    const sleep = Number(formData.sleep_hours);
    const bpm = Number(formData.heart_rate);

    if (phq9 < 0 || phq9 > 27) invalidRanges.push('PHQ-9 (0-27)');
    if (gad7 < 0 || gad7 > 21) invalidRanges.push('GAD-7 (0-21)');
    if (age < 5 || age > 120) invalidRanges.push('Age (5-120)');
    if (sleep < 0 || sleep > 24) invalidRanges.push('Sleep (0-24 hrs)');
    if (bpm < 30 || bpm > 250) invalidRanges.push('BPM (30-250)');

    if (invalidRanges.length > 0) {
      toast.error(`Invalid metrics: ${invalidRanges.join(' | ')}`, {
        style: { borderRadius: '16px', background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' }
      });
      return;
    }

    const isValidNarrative = formData.narrative?.trim().length > 0 && /[a-zA-Z].*[a-zA-Z].*[a-zA-Z]/.test(formData.narrative);

    if (!isValidNarrative) {
      toast.error("Please describe your emotional state in words.", { 
        style: { borderRadius: '100px', background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' } 
      });
      return;
    }

    localStorage.setItem('tracemind_last_assessment', JSON.stringify({
      ...formData, narrative: "" 
    }));

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/analyze`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimeout(() => { 
        setResult({
          ...response.data,
          original_text: formData.narrative 
        }); 
        setPage('result'); 
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        syncWithCloud(token);
        toast.success("Analysis Complete", {
          style: { borderRadius: '100px', background: '#022c22', color: '#34d399', border: '1px solid #064e3b' }
        });
      }, 1500);
    } catch (err) { 
      toast.error("TraceMind Backend Offline!", {
        style: { borderRadius: '100px', background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' }
      });
      setLoading(false); 
    }
  };

  const handleFooterLink = (type) => {
    setActiveModal(type);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const renderAppContent = () => {
    if (showLanding) return (
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200">
        <Header isAuthenticated={false} setShowLanding={setShowLanding} />
        <main className="flex-grow flex items-center justify-center">
          <LandingPage onGetStarted={() => setShowLanding(false)} />
        </main>
        <GlobalFooter handleFooterLink={handleFooterLink} />
      </div>
    );

    if (!isAuthenticated) return (
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200">
        <Header isAuthenticated={false} setShowLanding={setShowLanding} />
        <Toaster position="top-center" />
        <main className="flex-grow flex items-center justify-center py-10">
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        </main>
        <GlobalFooter handleFooterLink={handleFooterLink} />
      </div>
    );

    return (
      <div className="h-screen flex bg-[#020617] font-sans text-slate-200 overflow-hidden">
        <Toaster position="top-center" />
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          setPage={setPage} 
          resetForm={() => setFormData(getDynamicInitialState())} 
          page={page}
        />
        <div className="flex-1 flex flex-col h-full min-w-0">
          <Header 
            isAuthenticated={isAuthenticated} 
            isSidebarOpen={isSidebarOpen} 
            setIsSidebarOpen={setIsSidebarOpen} 
            userName={userName} 
            userEmail={userEmail} 
            handleLogout={handleLogout} 
            setPage={setPage}
            setShowLanding={setShowLanding}
          />
          <div className="flex-1 overflow-y-auto w-full flex flex-col">
            <main className="flex-grow px-6 md:px-14 py-6 w-full">
              <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={page} 
                    initial="initial" animate="in" exit="out" variants={pageVariants} 
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full"
                  >
                    {page === 'input' ? 
                      <InputPage 
                        formData={formData} 
                        setFormData={setFormData} 
                        executeAnalysis={executeAnalysis} 
                        loading={loading} 
                        profile={cloudProfile} 
                        dbLastRecord={dbLastRecord} 
                      />
                    : page === 'history' ? <HistoryPage />
                    : page === 'analytics' ? <AnalyticsPage />
                    : page === 'settings' ? <SettingsPage userName={userName} userEmail={userEmail} /> 
                    : <ResultPage result={result} setPage={setPage} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
            <GlobalFooter handleFooterLink={handleFooterLink} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderAppContent()}
      <AnimatePresence>
        {activeModal && (
          <InfoModal type={activeModal} onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;