import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Target, Briefcase, LogOut, Sparkles } from 'lucide-react';


export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('learning'); // Controls the visible view
  
  // States for the Learning Hub
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // States for the new tabs
  const [assessmentData, setAssessmentData] = useState('');
  const [opportunityData, setOpportunityData] = useState('');
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  // States for interactive grading
  const [studentAnswers, setStudentAnswers] = useState('');
  const [gradingResult, setGradingResult] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('studentProfile');
    if (!savedProfile) {
      navigate('/onboarding');
      return;
    }
    const parsed = JSON.parse(savedProfile);
    setProfile(parsed);
   setMessages([
      { 
        role: 'ai', 
        text: `Welcome aboard, ${parsed.name}! I see you're focusing on **${parsed.domain}** with the goal to **${parsed.goals}**. I am AURA, your Adaptive Unified Reasoning Assistant. How can we advance your journey today?` 
      }
    ]);
  }, [navigate]);

  // Existing Chat Function
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.name.toLowerCase().replace(/\s+/g, '-'),
          message: `[Context: Student is in ${profile.year} studying ${profile.domain}. Goal: ${profile.goals}]. Student asks: ${input}`
        })
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Connection error. Please check your AWS API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Smart Assessment Function
const generateAssessment = async () => {
    setIsGeneratingData(true);
    setAssessmentData('');
    setStudentAnswers(''); // Clear previous answers
    setGradingResult('');  // Clear previous grades
    
    try {
      const response = await fetch(import.meta.env.VITE_API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.name.toLowerCase().replace(/\s+/g, '-'),
          // Prompt strictly enforces the primary goal
          message: `Act as a strict academic examiner. The student is studying ${profile.domain}. Their primary goal is: "${profile.goals}". Generate a 3-question diagnostic assessment strictly focused on helping them achieve this specific goal. Output ONLY the questions. Do not provide the answers.`
        })
      });
      const data = await response.json();
      setAssessmentData(data.reply);
    } catch (error) {
      setAssessmentData('Error generating assessment. Please try again.');
    } finally {
      setIsGeneratingData(false);
    }
  };

  const submitAssessment = async () => {
    if (!studentAnswers.trim()) return;
    setIsGrading(true);
    
    try {
      const response = await fetch(import.meta.env.VITE_API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.name.toLowerCase().replace(/\s+/g, '-'),
          // The Grading Prompt
          message: `You are an expert evaluator. The student was asked these questions to help achieve their goal of ${profile.goals}:\n\n${assessmentData}\n\nHere are the student's answers:\n\n${studentAnswers}\n\nPlease grade these answers. Provide a short, encouraging feedback summary, politely point out any mistakes, and give a final score out of 10.`
        })
      });
      const data = await response.json();
      setGradingResult(data.reply);
    } catch (error) {
      setGradingResult('Error grading assessment. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  // NEW: Opportunities Function
// NEW: Opportunity Intelligence with RAG (Filtering Real Jobs)
  const generateOpportunities = async () => {
    setIsGeneratingData(true);
    setOpportunityData('');
    
    // 1. The "Scraped" Data from getsig.in/jobs
    // In production, you'd use fetch() to hit an API. For a hackathon, providing a diverse array 
    // of dummy data proves the RAG concept perfectly without risking live CORS errors!
    const liveJobsList = [
      { role: "Frontend Web Intern", company: "SignalTech", domain: "Engineering", reqs: "React, Tailwind", link: "https://getsig.in/jobs" },
      { role: "Machine Learning Intern", company: "DataCorp", domain: "Engineering", reqs: "Python, AWS, ML", link: "https://getsig.in/jobs" },
      { role: "Clinical Trial Assistant", company: "MedResearch", domain: "MBBS / Medical", reqs: "Patient screening, clinical background", link: "https://getsig.in/jobs" },
      { role: "Data Science Analyst", company: "FinTech Solutions", domain: "Research / PhD", reqs: "Statistics, Python", link: "https://getsig.in/jobs" },
      { role: "Full Stack Developer", company: "StartupInc", domain: "Engineering", reqs: "Node.js, React, APIs", link: "https://getsig.in/jobs" }
    ];

    try {
      const response = await fetch(import.meta.env.VITE_API_GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile.name.toLowerCase().replace(/\s+/g, '-'),
          // 2. The RAG Prompt: We force Amazon Nova to ONLY use our provided data
          message: `Act as a career counselor. The student is in ${profile.year} studying ${profile.domain} with a goal of ${profile.goals}. 
          
          Here are the live opportunities currently scraped from the job board:
          ${JSON.stringify(liveJobsList)}
          
          RULE: You must ONLY select from the list provided above. Do not invent fake jobs. Filter the list and pick the 1 or 2 absolute best matches for this specific student. Format them beautifully. For EVERY job you select, you MUST include a clear, clickable Markdown link using the 'link' property provided so the student can apply immediately (e.g., [Apply on Signal here](URL)).`
        })
      });

      const data = await response.json();
      setOpportunityData(data.reply);
    } catch (error) {
      setOpportunityData('Error generating opportunities. Please try again.');
    } finally {
      setIsGeneratingData(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentProfile');
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl mb-10 tracking-tight">
          <Target className="w-8 h-8" />
          <span>AURA</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'learning' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Learning Hub
          </button>
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'assessments' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <BookOpen className="w-5 h-5" /> Smart Assessments
          </button>
          <button 
            onClick={() => setActiveTab('opportunities')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-colors ${activeTab === 'opportunities' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Briefcase className="w-5 h-5" /> Opportunities
          </button>
        </nav>

        <div className="border-t border-slate-200 pt-6 mt-6">
          <div className="mb-4">
            <p className="text-sm font-bold text-slate-800">{profile.name}</p>
            <p className="text-xs text-slate-500">{profile.domain} • {profile.year}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-700">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 flex flex-col h-screen p-6">
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          
          {/* Top Header */}
          <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 capitalize">AURA {activeTab.replace('-', ' ')}</h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AURA Active
            </span>
          </div>

          {/* TAB 1: LEARNING HUB */}
          {activeTab === 'learning' && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-5 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm md:prose-base prose-slate max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none p-5 shadow-sm animate-pulse">
                      Analyzing contextual progress...
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for a roadmap, concept explanation, etc..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    disabled={isLoading}
                  />
                  <button type="submit" disabled={isLoading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50">
                    Send
                  </button>
                </form>
              </div>
            </>
          )}

          {/* TAB 2: SMART ASSESSMENTS */}
          {activeTab === 'assessments' && (
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 flex flex-col items-center">
              {!assessmentData ? (
                <div className="text-center mt-20 max-w-lg">
                  <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Goal-Oriented Gap Analysis</h3>
                  <p className="text-slate-600 mb-8">Generate a custom test specifically designed to help you reach your goal: <strong>{profile.goals}</strong>.</p>
                  <button 
                    onClick={generateAssessment} 
                    disabled={isGeneratingData}
                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingData ? 'Generating Test...' : 'Generate My Assessment'}
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-3xl space-y-6 pb-12">
                  {/* The Questions */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-4 mb-4">Your Assessment</h3>
                    <ReactMarkdown>{assessmentData}</ReactMarkdown>
                  </div>

                  {/* The Submission Area */}
                  {!gradingResult ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <label className="block text-sm font-bold text-slate-700 mb-3">Type your answers below:</label>
                      <textarea
                        value={studentAnswers}
                        onChange={(e) => setStudentAnswers(e.target.value)}
                        placeholder="1. The answer to the first question is..."
                        className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
                        disabled={isGrading}
                      />
                      <div className="flex justify-end gap-3">
                        <button onClick={generateAssessment} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 disabled:opacity-50" disabled={isGrading}>
                          Regenerate Test
                        </button>
                        <button onClick={submitAssessment} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50" disabled={isGrading || !studentAnswers.trim()}>
                          {isGrading ? 'Grading...' : 'Submit for Grading'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* The AI Feedback */
                    <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 prose prose-slate max-w-none">
                      <h3 className="text-lg font-bold text-blue-900 border-b border-blue-200 pb-4 mb-4">AI Evaluator Feedback</h3>
                      <ReactMarkdown>{gradingResult}</ReactMarkdown>
                      <button onClick={generateAssessment} className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                        Take a New Assessment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 flex flex-col items-center">
              {!opportunityData ? (
                <div className="text-center mt-20 max-w-lg">
                  <Briefcase className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Opportunity Intelligence</h3>
                  <p className="text-slate-600 mb-8">Discover internships, capstone projects, and programs tailored to your goal of {profile.goals}.</p>
                  <button 
                    onClick={generateOpportunities} 
                    disabled={isGeneratingData}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingData ? 'Scanning Opportunities...' : 'Find Opportunities'}
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200 prose prose-slate">
                  <ReactMarkdown>{opportunityData}</ReactMarkdown>
                  <button onClick={generateOpportunities} className="mt-8 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                    Scan for More
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}