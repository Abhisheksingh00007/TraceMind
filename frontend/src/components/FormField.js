import React from 'react';

export const FormField = ({ label, icon: Icon, name, value, onChange, type = "number", options = null, placeholder = "" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-300 flex items-center uppercase tracking-[0.2em]">
      {Icon && <Icon className="w-3 h-3 mr-1.5 text-cyan-500" />} {label}
    </label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-cyan-500/50 outline-none transition-all font-bold text-slate-200 cursor-pointer appearance-none"
      >
        {options.map(opt => <option key={opt.val} value={opt.val} className="bg-slate-900">{opt.label}</option>)}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-cyan-500/50 outline-none transition-all font-bold text-slate-200"
      />
    )}
  </div>
);

export const CheckboxGroup = ({ options, selectedValues, onChange }) => (
  <div className="grid grid-cols-2 gap-3">
    {options.map(opt => (
      <label key={opt} className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${selectedValues.includes(opt) ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-950/30 border-slate-800 hover:border-slate-700'}`}>
        <input
          type="checkbox"
          checked={selectedValues.includes(opt)}
          onChange={() => onChange(opt)}
          className="hidden"
        />
        <span className={`text-xs font-bold tracking-tight ${selectedValues.includes(opt) ? 'text-cyan-400' : 'text-slate-300'}`}>{opt}</span>
      </label>
    ))}
  </div>
);