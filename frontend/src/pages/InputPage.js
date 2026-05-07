import React, { useState } from 'react';
import { Activity, User, Ruler, Scale, ListChecks, Heart, Clock, Loader2, FileText, Calculator, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormField, CheckboxGroup } from '../components/FormField';

const symptomOptions = ["Social Withdrawal", "Chest Pain", "Headaches", "Panic Attacks", "Loss of Appetite", "Chronic Fatigue"];

const phq9Questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself or that you are a failure?",
  "Trouble concentrating on things, such as reading or watching TV?",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite?",
  "Thoughts that you would be better off dead, or of hurting yourself?"
];

const gad7Questions = [
  "Feeling nervous, anxious, or on edge?",
  "Not being able to stop or control worrying?",
  "Worrying too much about different things?",
  "Trouble relaxing?",
  "Being so restless that it is hard to sit still?",
  "Becoming easily annoyed or irritable?",
  "Feeling afraid, as if something awful might happen?"
];

const scoreOptions = [
  { label: "Not at all (0)", value: 0 },
  { label: "Several days (1)", value: 1 },
  { label: "More than half days (2)", value: 2 },
  { label: "Nearly every day (3)", value: 3 }
];

export const InputPage = ({ formData, setFormData, executeAnalysis, loading, profile, dbLastRecord }) => {
  const [showCalc, setShowCalc] = useState(false);
  const [calcType, setCalcType] = useState('PHQ9');
  const [answers, setAnswers] = useState([]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSymptomChange = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom) 
        ? prev.symptoms.filter(s => s !== symptom) 
        : [...prev.symptoms, symptom]
    }));
  };

  const openCalculator = (type) => {
    setCalcType(type);
    setAnswers(Array(type === 'PHQ9' ? 9 : 7).fill(0));
    setShowCalc(true);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const calculateAndSave = () => {
    const totalScore = answers.reduce((a, b) => a + b, 0);
    setFormData(prev => ({
      ...prev,
      [calcType === 'PHQ9' ? 'phq9_score' : 'gad7_score']: totalScore
    }));
    setShowCalc(false);
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
            
            <div className="flex flex-col space-y-2">
              <FormField label="PHQ-9" name="phq9_score" type="number" value={formData.phq9_score} onChange={handleChange} />
              <button 
                onClick={() => openCalculator('PHQ9')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center transition-colors outline-none"
              >
                <Calculator size={12} className="mr-1" /> Calculate Score
              </button>
            </div>

            <div className="flex flex-col space-y-2">
              <FormField label="GAD-7" name="gad7_score" type="number" value={formData.gad7_score} onChange={handleChange} />
              <button 
                onClick={() => openCalculator('GAD7')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center transition-colors outline-none"
              >
                <Calculator size={12} className="mr-1" /> Calculate Score
              </button>
            </div>
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

      {/* Calculator Modal */}
      {showCalc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 pb-4 border-b border-slate-800 z-10">
              <div>
                <h3 className="text-2xl font-bold text-white uppercase flex items-center">
                  <Calculator className="mr-3 text-cyan-500" /> {calcType} Assessment
                </h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Select an option for each question</p>
              </div>
              <button onClick={() => setShowCalc(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors outline-none">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {(calcType === 'PHQ9' ? phq9Questions : gad7Questions).map((question, qIndex) => (
                <div key={qIndex} className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800">
                  <p className="text-slate-200 font-medium mb-4">{qIndex + 1}. {question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {scoreOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswerChange(qIndex, opt.value)}
                        className={`py-3 px-2 text-xs font-semibold rounded-xl border transition-all ${
                          answers[qIndex] === opt.value 
                            ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center sticky bottom-0 bg-slate-900">
              <div className="text-slate-300">
                Current Score: <span className="text-2xl font-bold text-white ml-2">{answers.reduce((a, b) => a + b, 0)}</span>
              </div>
              <button 
                onClick={calculateAndSave} 
                className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
              >
                Apply Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
