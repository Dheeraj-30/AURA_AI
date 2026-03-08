import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    domain: 'Engineering',
    year: '1st Year',
    goals: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to local storage for the hackathon MVP
    localStorage.setItem('studentProfile', JSON.stringify(formData));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Set Up Your AURA Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Academic Domain</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.domain}
              onChange={(e) => setFormData({...formData, domain: e.target.value})}
            >
              <option>Engineering</option>
              <option>MBBS / Medical</option>
              <option>Research / PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Year</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: e.target.value})}
            >
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year / Final</option>
              <option>Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Primary Goal</label>
            <input 
              required
              type="text" 
              placeholder="e.g., Get a FAANG internship, Crack NEET-PG..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mt-6"
          >
            Generate My Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}