"use client";
import { useState, useEffect, useRef } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Brain, Code, Mic, BookOpen, Loader2, Send, ChevronLeft, Star, RefreshCw, CheckCircle, XCircle, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const API = "http://localhost:5000/api/ai";

// ─── Markdown-like renderer (simple) ────────────────────────────────────────
function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-indigo-400 mt-4">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="font-bold text-white mt-3">{line.slice(4)}</h3>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-indigo-300">{line.slice(2, -2)}</p>;
        if (line.match(/^\*\*/)) {
          return <p key={i} className="text-gray-200" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>') }} />;
        }
        if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-300 list-disc">{line.slice(2)}</li>;
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-gray-300">{line}</p>;
      })}
    </div>
  );
}

// ─── Code Review Tab ─────────────────────────────────────────────────────────
function CodeReviewTab({ user }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setReview(null);
    try {
      const res = await axios.post(`${API}/review-code`, { code, language }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReview(res.data.review);
    } catch (err) {
      setReview("Error getting review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium text-gray-400">Language:</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500">
            {['javascript','python','java','cpp','typescript','go','rust'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={16}
            placeholder={`Paste your ${language} code here for a thorough AI review...`}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl p-4 text-sm font-mono text-gray-200 outline-none focus:border-indigo-500 resize-none"
          />
        </div>
        <button onClick={handleReview} disabled={loading || !code.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Code...</> : <><Sparkles className="w-5 h-5" /> Review My Code</>}
        </button>
      </div>

      {/* Output Panel */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 min-h-64">
        {!review && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-500">
            <Code className="w-12 h-12 mb-4 opacity-40" />
            <p className="font-medium">Paste your code and click Review</p>
            <p className="text-sm mt-1">Get instant feedback on bugs, quality & improvements</p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full py-12 text-indigo-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Analyzing your code...</p>
          </div>
        )}
        {review && !loading && (
          <div>
            <h3 className="font-bold text-indigo-400 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Code Review</h3>
            <MarkdownText text={review} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Interview Prep Tab ───────────────────────────────────────────────────────
function InterviewPrepTab({ user }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [phase, setPhase] = useState('setup');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [error, setError] = useState('');

  const getQuestion = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setUserAnswer('');
    setFeedback('');
    try {
      const res = await axios.post(`${API}/interview-prep`, { topic, difficulty, mode: 'question' }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCurrentQuestion(res.data.question);
      setPhase('answering');
      setSessionCount(c => c + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to AI. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setPhase('feedback');
    try {
      const res = await axios.post(`${API}/interview-prep`, {
        topic, mode: 'evaluate', question: currentQuestion, userAnswer
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setFeedback(res.data.feedback);
    } catch (err) {
      setFeedback("Error evaluating answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Setup */}
      {phase === 'setup' && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-lg text-white flex items-center gap-2"><Mic className="text-indigo-400 w-5 h-5" /> Configure Your Session</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Topic / Role</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. React, System Design, Python, Data Structures..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
            <div className="flex gap-3">
              {['easy','medium','hard'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm capitalize transition-colors ${difficulty === d ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-500 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          <button onClick={getQuestion} disabled={!topic.trim() || loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mic className="w-5 h-5" /> Start Interview</>}
          </button>
        </div>
      )}

      {/* Question */}
      {(phase === 'answering' || phase === 'feedback') && (
        <div className="space-y-4">
          <div className="bg-gray-800 border border-indigo-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Mic className="w-4 h-4" /> Question {sessionCount} • {difficulty} • {topic}
            </div>
            <p className="text-white text-lg font-medium leading-relaxed">{currentQuestion}</p>
          </div>

          {phase === 'answering' && (
            <>
              <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} rows={6}
                placeholder="Type your answer here... be thorough and explain your thinking."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-200 outline-none focus:border-indigo-500 resize-none" />
              <div className="flex gap-3">
                <button onClick={submitAnswer} disabled={!userAnswer.trim() || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Answer</>}
                </button>
                <button onClick={() => setPhase('setup')}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors">
                  Skip
                </button>
              </div>
            </>
          )}

          {phase === 'feedback' && (
            <>
              {loading ? (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 flex items-center justify-center gap-3 text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" /> Evaluating your answer...
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                  <h4 className="font-bold text-indigo-400 mb-4 flex items-center gap-2"><Star className="w-4 h-4" /> AI Evaluation</h4>
                  <MarkdownText text={feedback} />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={getQuestion}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <RefreshCw className="w-5 h-5" /> Next Question
                </button>
                <button onClick={() => { setPhase('setup'); setCurrentQuestion(''); setFeedback(''); }}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white transition-colors text-sm">
                  New Topic
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Study Planner Tab ────────────────────────────────────────────────────────
function StudyPlannerTab({ user }) {
  const [form, setForm] = useState({ topic: '', durationWeeks: 4, hoursPerDay: 2, currentLevel: 'beginner' });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setLoading(true);
    setPlan(null);
    setError('');
    try {
      const res = await axios.post(`${API}/study-planner`, form, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPlan(res.data.plan);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to AI. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Config */}
      <div className="space-y-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2"><BookOpen className="text-indigo-400 w-5 h-5" /> Plan Settings</h3>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Topic / Skill to Learn</label>
            <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
              placeholder="e.g. Machine Learning, React, AWS..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Duration (weeks)</label>
            <input type="number" min="1" max="24" value={form.durationWeeks} onChange={e => setForm({...form, durationWeeks: Number(e.target.value)})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hours Per Day</label>
            <input type="number" min="0.5" max="12" step="0.5" value={form.hoursPerDay} onChange={e => setForm({...form, hoursPerDay: Number(e.target.value)})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Current Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['beginner','intermediate','advanced'].map(l => (
                <button key={l} onClick={() => setForm({...form, currentLevel: l})}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${form.currentLevel === l ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading || !form.topic.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Plan</>}
          </button>
        </div>
      </div>

      {/* Plan Output */}
      <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-2xl p-6 min-h-96">
        {!plan && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-gray-500">
            <BookOpen className="w-14 h-14 mb-4 opacity-30" />
            <p className="font-medium text-lg">Your Personalized Study Plan</p>
            <p className="text-sm mt-2 max-w-xs">Fill in your details and click Generate to get a week-by-week roadmap tailored to your goals.</p>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-indigo-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-medium">Crafting your personalized study plan...</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-500 rounded-xl p-4 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        {plan && !loading && (
          <div className="overflow-y-auto max-h-[70vh] pr-1">
            <MarkdownText text={plan} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIToolsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('review');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) router.push('/login');
  }, [user, router]);

  if (!mounted || !user) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
    </div>
  );

  const tabs = [
    { key: 'review', icon: <Code className="w-5 h-5" />, label: 'Code Review', desc: 'AI feedback on your code quality, bugs & improvements' },
    { key: 'interview', icon: <Mic className="w-5 h-5" />, label: 'Interview Prep', desc: 'Practice mock interviews with real-time AI evaluation' },
    { key: 'planner', icon: <BookOpen className="w-5 h-5" />, label: 'Study Planner', desc: 'Get a personalized week-by-week learning roadmap' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/student/dashboard" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">AI Learning Tools</h1>
              <p className="text-indigo-300 mt-1">Your personal AI tutor, mentor & career coach</p>
            </div>
          </div>
          {/* Tab selector */}
          <div className="flex gap-2 sm:gap-4 mt-8 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}`}>
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab description */}
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            {tabs.find(t => t.key === activeTab)?.icon}
          </div>
          <div>
            <h2 className="font-bold text-xl">{tabs.find(t => t.key === activeTab)?.label}</h2>
            <p className="text-gray-400 text-sm">{tabs.find(t => t.key === activeTab)?.desc}</p>
          </div>
        </div>

        {activeTab === 'review' && <CodeReviewTab user={user} />}
        {activeTab === 'interview' && <InterviewPrepTab user={user} />}
        {activeTab === 'planner' && <StudyPlannerTab user={user} />}
      </div>
    </div>
  );
}
