import React from 'react';
import { Activity, User, Ruler, Scale, ListChecks, Heart, Clock, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormField, CheckboxGroup } from '../components/FormField';

const symptomOptions = ["Social Withdrawal", "Chest Pain", "Headaches", "Panic Attacks", "Loss of Appetite", "Chronic Fatigue"];

export const InputPage = ({ formData, setFormData, executeAnalysis, loading, profile, dbLastRecord }) => {
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSymptomChange = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom) 
        ? prev.symptoms.filter(s => s !== symptom) 
        : [...prev.symptoms, symptom]
    }));
  };

  const handleStartAssessment = () => {
    const isValidNarrative = formData.narrative?.trim().length > 0 && /[a-zA-Z].*[a-zA-Z].*[a-zA-Z]/.test(formData.narrative);

    if (!isValidNarrative) {
      toast.error("Please describe your emotional state in words.", {
        icon: '✍️',
        style: {
          borderRadius: '15px',
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        }
      });
      return;
    }

    let refAge = profile?.age || dbLastRecord?.age;
    const refDob = profile?.dob; 

    if (!refAge && refDob) {
      const birthDate = new Date(refDob);
      const today = new Date();
      refAge = today.getFullYear() - birthDate.getFullYear();
    }

    const refHeight = profile?.height || dbLastRecord?.height;
    const refGender = profile?.gender || dbLastRecord?.gender;

    if (refAge && formData.age) {
      if (parseInt(formData.age, 10) < parseInt(refAge, 10)) {
        toast.error("Time travel detected! Age cannot be less than your previous assessment.");
        return; 
      }
    }

    if (refHeight && formData.height) {
      if (parseFloat(formData.height) < parseFloat(refHeight)) {
        toast.error("Invalid Input: Height cannot decrease.");
        return; 
      }
    }

    if (refGender && formData.gender) {
      if (formData.gender.toLowerCase() !== refGender.toLowerCase()) {
        toast.error("Gender locked: Please maintain your registered gender or update in Settings.");
        return; 
      }
    }

    executeAnalysis();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-white tracking-tight italic uppercase leading-tight">TraceMind</h1>
        <p className="text-slate-200 font-bold text-xs italic tracking-[0.3em] uppercase">Early Mental Health Detection System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 bg-slate-900/30 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-sm">
          <h2 className="text-[10px] font-bold text-slate-200 mb-4 flex items-center uppercase tracking-[0.3em]">
            <FileText className="mr-2 text-cyan-500" size={14}/> How are you feeling today?
          </h2>
          <textarea 
            value={formData.narrative} 
            onChange={handleChange} 
            name="narrative"
            className="w-full h-40 p-6 bg-slate-950/40 border border-slate-800 rounded-2xl focus:border-cyan-500/50 outline-none resize-none font-medium text-slate-200 transition-all text-lg"
            placeholder="Describe your current state and experiences..."
          />
        </div>

        <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-sm">
          <h2 className="text-[10px] font-bold text-slate-200 mb-4 flex items-center uppercase tracking-[0.3em]">
            <Activity className="mr-2 text-emerald-500" size={14}/> Physical Profile
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} icon={User} />
            
            <FormField 
              label="Gender" 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              options={[
                {val: '', label: 'Select Gender', disabled: true, hidden: true},
                {val: 'male', label: 'Male'}, 
                {val: 'female', label: 'Female'},
                {val: 'other', label: 'Other'}
              ]} 
            />
            
            <FormField label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} icon={Ruler} />
            <FormField label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} icon={Scale} />
          </div>
        </div>

        <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-sm">
          <h2 className="text-[10px] font-bold text-slate-200 mb-4 flex items-center uppercase tracking-[0.3em]">
            <ListChecks className="mr-2 text-purple-500" size={14}/> Current Symptom
          </h2>
          <CheckboxGroup options={symptomOptions} selectedValues={formData.symptoms} onChange={handleSymptomChange} />
        </div>

        <div className="md:col-span-2 bg-slate-900/30 p-8 rounded-3xl border border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <FormField label="BPM" name="heart_rate" type="number" value={formData.heart_rate} onChange={handleChange} icon={Heart} />
            <FormField label="Sleep (h)" name="sleep_hours" type="number" value={formData.sleep_hours} onChange={handleChange} icon={Clock} />
            <FormField label="PHQ-9" name="phq9_score" type="number" value={formData.phq9_score} onChange={handleChange} />
            <FormField label="GAD-7" name="gad7_score" type="number" value={formData.gad7_score} onChange={handleChange} />
          </div>
        </div>
      </div>

      <button 
        onClick={handleStartAssessment}
        disabled={loading} 
        className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl shadow-xl transition-all flex justify-center items-center text-xl active:scale-[0.98] border-b-4 border-cyan-800"
      >
        {loading ? <><Loader2 className="animate-spin mr-3" /> TRACING PATTERNS...</> : <>START ASSESSMENT</>}
      </button>
    </div>
  );
};