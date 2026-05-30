"use client";
import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import useCourseStore from "@/store/useCourseStore";
import { useRouter } from "next/navigation";
import { Brain, Sparkles, Loader2, ChevronLeft, CheckCircle, Plus, RefreshCw, BookOpen, AlertCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

const API = "http://localhost:5000/api";

export default function AIQuizGeneratorPage() {
  const { user } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ topic: '', numQuestions: 5, difficulty: 'Medium' });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      router.push('/login');
      return;
    }
    fetchCourses();
  }, [user, router]);

  const myCourses = courses.filter(c => c.instructor?._id === user?._id || c.instructor === user?._id);

  const handleGenerate = async () => {
    if (!form.topic.trim()) return;
    setLoading(true);
    setError('');
    setQuestions([]);
    setPublished(false);
    try {
      const res = await axios.post(`${API}/ai/generate-quiz`, form, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setQuestions(res.data.questions);
      setQuizTitle(`${form.topic} Quiz — AI Generated`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedCourseId || !quizTitle.trim() || questions.length === 0) return;
    setPublishing(true);
    try {
      await axios.post(`${API}/courses/${selectedCourseId}/quizzes`, {
        title: quizTitle,
        timeLimit: 0,
        module: 'AI Generated',
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex
        }))
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setPublished(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error publishing quiz. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  if (!mounted || !user) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-gray-900 to-purple-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/instructor/dashboard" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">AI Quiz Generator</h1>
              <p className="text-indigo-300 mt-1">Generate professional quiz questions from any topic in seconds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Config Form */}
          <div className="space-y-5">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2"><Sparkles className="text-indigo-400 w-5 h-5" /> Generation Settings</h2>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Topic or Subject *</label>
                <input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                  placeholder="e.g. JavaScript Closures, React Hooks, Binary Trees..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Number of Questions</label>
                <div className="flex gap-2">
                  {[3, 5, 8, 10].map(n => (
                    <button key={n} onClick={() => setForm({...form, numQuestions: n})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${form.numQuestions === n ? 'bg-indigo-600 text-white' : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {['Easy','Medium','Hard'].map(d => (
                    <button key={d} onClick={() => setForm({...form, difficulty: d})}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${form.difficulty === d
                        ? d === 'Easy' ? 'bg-green-600 text-white' : d === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={loading || !form.topic.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Brain className="w-5 h-5" /> Generate Quiz</>}
              </button>
            </div>

            {/* Publish Panel */}
            {questions.length > 0 && !published && (
              <div className="bg-gray-800 border border-green-500/30 rounded-2xl p-5 space-y-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-green-400"><BookOpen className="w-5 h-5" /> Publish to Course</h2>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quiz Title</label>
                  <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Select Course</label>
                  <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-indigo-500">
                    <option value="">— Choose a course —</option>
                    {myCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <button onClick={handlePublish} disabled={publishing || !selectedCourseId || !quizTitle.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  {publishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Publish Quiz</>}
                </button>
              </div>
            )}

            {published && (
              <div className="bg-green-900/30 border border-green-500 rounded-2xl p-5 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
                <div>
                  <div className="font-bold text-green-400">Quiz Published!</div>
                  <div className="text-sm text-green-300/80">Students can now take it in the course.</div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Generated Questions */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {!loading && questions.length === 0 && !error && (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl flex flex-col items-center justify-center py-20 text-center text-gray-500">
                <Brain className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Generated questions will appear here</p>
                <p className="text-sm mt-2 max-w-xs">Configure your settings on the left and click Generate Quiz to start.</p>
              </div>
            )}

            {loading && (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl flex flex-col items-center justify-center py-20 text-indigo-400">
                <Loader2 className="w-14 h-14 animate-spin mb-4" />
                <p className="font-bold text-lg">Generating {form.numQuestions} questions...</p>
                <p className="text-sm text-gray-400 mt-2">AI is crafting high-quality quiz questions</p>
              </div>
            )}

            {!loading && questions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{questions.length} Questions Generated</h3>
                  <button onClick={handleGenerate} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    <RefreshCw className="w-4 h-4" /> Regenerate
                  </button>
                </div>
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <input value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-indigo-500 font-medium" />
                    </div>
                    <div className="space-y-2 pl-10">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className={`flex items-center gap-2 p-2 rounded-lg border ${q.correctAnswerIndex === optIdx ? 'border-green-500/50 bg-green-900/20' : 'border-gray-700'}`}>
                          <button onClick={() => updateQuestion(qIdx, 'correctAnswerIndex', optIdx)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${q.correctAnswerIndex === optIdx ? 'border-green-500 bg-green-500' : 'border-gray-600 hover:border-indigo-400'}`}>
                            {q.correctAnswerIndex === optIdx && <CheckCircle className="w-3 h-3 text-white" />}
                          </button>
                          <span className="text-xs font-bold text-gray-500 w-5">{String.fromCharCode(65 + optIdx)}.</span>
                          <input value={opt} onChange={e => updateOption(qIdx, optIdx, e.target.value)}
                            className="flex-1 bg-transparent text-sm text-gray-200 outline-none" />
                          {q.correctAnswerIndex === optIdx && <span className="text-xs text-green-400 font-bold shrink-0">✓ Correct</span>}
                        </div>
                      ))}
                    </div>
                    <p className="pl-10 text-xs text-gray-500">Click a circle to mark the correct answer. Edit any question or option inline.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
