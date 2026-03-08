import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Target, Briefcase } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Meet <span className="text-blue-600">AURA</span>
        </h1>
        <p className="text-2xl font-semibold text-slate-700 mt-4">
          Your Adaptive Unified Reasoning Assistant
        </p>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mt-4">
          Stop struggling with scattered resources. Get personalized learning roadmaps, smart gap analysis, and proactive internship opportunities tailored perfectly to your domain.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Target className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Adaptive Roadmaps</h3>
            <p className="text-slate-600 text-sm">Dynamic learning paths that evolve with your progress and target your specific weak areas.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <BrainCircuit className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Domain Intelligence</h3>
            <p className="text-slate-600 text-sm">Specialized guidance for Engineering, MBBS, and Research students.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Briefcase className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Opportunity Matching</h3>
            <p className="text-slate-600 text-sm">Proactive discovery of internships and scholarships you are actually qualified for.</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/onboarding')}
          className="mt-12 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
}