"use client";
import { useEffect, useState, use } from "react";
import useCourseStore from "@/store/useCourseStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Edit, Video, Book, HelpCircle, Code, Brain, Sparkles, RefreshCw, CheckCircle } from "lucide-react";
import axios from "axios";

export default function ManageCourse({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseData, setCourseData] = useState({ title: "", description: "", price: 0, thumbnail: "", category: "" });

  const [newVideo, setNewVideo] = useState({ title: "", description: "", videoUrl: "", duration: 0, module: "General" });
  
  // New Quiz State
  const [newQuiz, setNewQuiz] = useState({ title: "", timeLimit: 0, module: "General" });
  const [quizQuestions, setQuizQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
  
  // New Assignment State
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", maxScore: 100, module: "General" });
  
  const [newResource, setNewResource] = useState({ title: '', url: '', module: 'General' });
  const [newProblem, setNewProblem] = useState({ title: '', description: '', language: 'javascript', starterCode: '', testInput: '', expectedOutput: '', module: 'General' });

  // AI Quiz Generation State
  const [aiQuizForm, setAiQuizForm] = useState({ topic: '', numQuestions: 5, difficulty: 'Medium' });
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPublishing, setAiPublishing] = useState(false);
  const [aiQuizTitle, setAiQuizTitle] = useState('');
  const [aiPublished, setAiPublished] = useState(false);
  const [showAIQuiz, setShowAIQuiz] = useState(false);
  
  const fetchCourse = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(res.data);
      setCourseData({
        title: res.data.title,
        description: res.data.description,
        price: res.data.price,
        thumbnail: res.data.thumbnail,
        category: res.data.category
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      router.push("/login");
      return;
    }
    fetchCourse();
  }, [id, user, router]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/videos`, newVideo, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewVideo({ title: "", description: "", videoUrl: "", duration: 0, module: "General" });
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding video");
    }
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    const formattedQuiz = {
      title: newQuiz.title,
      timeLimit: parseInt(newQuiz.timeLimit),
      module: newQuiz.module,
      questions: quizQuestions.map(q => ({
        question: q.question,
        options: q.options.filter(Boolean),
        correctAnswerIndex: parseInt(q.correctAnswerIndex)
      }))
    };
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/quizzes`, formattedQuiz, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewQuiz({ title: "", timeLimit: 0, module: "General" });
      setQuizQuestions([{ question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
      fetchCourse();
      alert("Quiz added successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding quiz");
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/assignments`, newAssignment, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewAssignment({ title: "", description: "", maxScore: 100, module: "General" });
      fetchCourse();
      alert("Assignment added successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding assignment");
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/resources`, newResource, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewResource({ title: "", url: "", module: "General" });
      fetchCourse();
      alert("Resource added successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding resource");
    }
  };

  const handleDeleteItem = async (type, itemId) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}/${type}/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Error deleting ${type}`);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/courses/${id}`, courseData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert("Course updated successfully!");
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert("Error updating course");
    }
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    const formattedProblem = {
      title: newProblem.title,
      description: newProblem.description,
      language: newProblem.language,
      starterCode: newProblem.starterCode,
      testCases: [{ input: newProblem.testInput, expectedOutput: newProblem.expectedOutput }],
      module: newProblem.module
    };
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/problems`, formattedProblem, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewProblem({ title: '', description: '', language: 'javascript', starterCode: '', testInput: '', expectedOutput: '', module: 'General' });
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding problem');
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!aiQuizForm.topic.trim()) return;
    setAiGenerating(true);
    setAiError('');
    setAiGeneratedQuestions([]);
    setAiPublished(false);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/generate-quiz', aiQuizForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAiGeneratedQuestions(res.data.questions);
      setAiQuizTitle(`${aiQuizForm.topic} Quiz (AI Generated)`);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Error generating quiz. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePublishAIQuiz = async () => {
    if (!aiQuizTitle.trim() || aiGeneratedQuestions.length === 0) return;
    setAiPublishing(true);
    try {
      await axios.post(`http://localhost:5000/api/courses/${id}/quizzes`, {
        title: aiQuizTitle,
        timeLimit: 0,
        module: 'AI Generated',
        questions: aiGeneratedQuestions
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setAiPublished(true);
      fetchCourse();
      setTimeout(() => { setShowAIQuiz(false); setAiGeneratedQuestions([]); setAiPublished(false); }, 2000);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Error publishing quiz.');
    } finally {
      setAiPublishing(false);
    }
  };

  const updateAIOption = (qIdx, optIdx, value) => {
    const updated = [...aiGeneratedQuestions];
    updated[qIdx].options[optIdx] = value;
    setAiGeneratedQuestions(updated);
  };

  const updateAICorrect = (qIdx, correctIdx) => {
    const updated = [...aiGeneratedQuestions];
    updated[qIdx].correctAnswerIndex = correctIdx;
    setAiGeneratedQuestions(updated);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!course) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/instructor/dashboard')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-1 text-sm">&larr; Back to Dashboard</button>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">Manage: {course.title}</h1>
            <p className="text-gray-400 mt-1 text-sm">Add and manage videos, quizzes, and resources.</p>
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-800 mb-8 overflow-x-auto">
          <button onClick={() => setActiveTab('details')} className={`pb-4 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-2"><Edit className="w-5 h-5" /> Course Details</div>
          </button>
          <button onClick={() => setActiveTab('videos')} className={`pb-4 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'videos' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-2"><Video className="w-5 h-5" /> Videos</div>
          </button>
          <button onClick={() => setActiveTab('quizzes')} className={`pb-4 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'quizzes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Quizzes</div>
          </button>
          <button onClick={() => setActiveTab('assignments')} className={`pb-4 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'assignments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-2"><Book className="w-5 h-5" /> Assignments</div>
          </button>
          <button onClick={() => setActiveTab('problems')} className={`pb-4 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'problems' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-2"><Code className="w-5 h-5" /> Coding Problems</div>
          </button>
          <button onClick={() => setActiveTab('resources')} className={`pb-4 px-4 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'resources' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <div className="flex items-center gap-2"><Book className="w-5 h-5" /> Resources</div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Form Area */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 sticky top-8">
              
              {activeTab === 'details' && (
                <form onSubmit={handleUpdateCourse} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-indigo-400">Edit Course Info</h3>
                  <div><label className="block text-sm text-gray-400 mb-1">Title</label><input type="text" required value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Thumbnail URL</label><input type="url" value={courseData.thumbnail} onChange={e => setCourseData({...courseData, thumbnail: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea required value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 h-24" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Price ($)</label><input type="number" required value={courseData.price} onChange={e => setCourseData({...courseData, price: Number(e.target.value)})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Category</label><input type="text" required value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Edit className="w-5 h-5" /> Save Changes</button>
                </form>
              )}

              {activeTab === 'videos' && (
                <form onSubmit={handleAddVideo} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-indigo-400">Add New Video</h3>
                  <div><label className="block text-sm text-gray-400 mb-1">Title</label><input type="text" required value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Module / Chapter Name</label><input type="text" value={newVideo.module} onChange={e => setNewVideo({...newVideo, module: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" placeholder="e.g. Chapter 1: Basics" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Video URL (e.g. YouTube/Cloudinary)</label><input type="url" required value={newVideo.videoUrl} onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Duration (mins)</label><input type="number" required value={newVideo.duration} onChange={e => setNewVideo({...newVideo, duration: Number(e.target.value)})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 h-24" /></div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Add Video</button>
                </form>
              )}

              {activeTab === 'quizzes' && (
                <>
                {/* AI Quiz Generator Toggle */}
                <div className="mb-4">
                  <button type="button" onClick={() => { setShowAIQuiz(!showAIQuiz); setAiGeneratedQuestions([]); setAiError(''); }}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${showAIQuiz ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30'}`}>
                    <Brain className="w-4 h-4" /> {showAIQuiz ? 'Hide AI Generator' : '✨ Generate Quiz with AI'}
                  </button>
                </div>

                {/* AI Quiz Generator Panel */}
                {showAIQuiz && (
                  <div className="mb-6 bg-gray-900 border border-purple-500/30 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-purple-400 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4" /> AI Quiz Generator</h4>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Topic</label>
                      <input value={aiQuizForm.topic} onChange={e => setAiQuizForm({...aiQuizForm, topic: e.target.value})}
                        placeholder="e.g. React Hooks, Binary Trees..."
                        className="w-full p-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-sm text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Questions</label>
                        <select value={aiQuizForm.numQuestions} onChange={e => setAiQuizForm({...aiQuizForm, numQuestions: Number(e.target.value)})}
                          className="w-full p-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-sm text-white">
                          {[3,5,8,10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                        <select value={aiQuizForm.difficulty} onChange={e => setAiQuizForm({...aiQuizForm, difficulty: e.target.value})}
                          className="w-full p-2.5 bg-gray-800 rounded-lg border border-gray-700 outline-none focus:border-purple-500 text-sm text-white">
                          {['Easy','Medium','Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    {aiError && <p className="text-red-400 text-xs">{aiError}</p>}
                    <button type="button" onClick={handleGenerateAIQuiz} disabled={aiGenerating || !aiQuizForm.topic.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                      {aiGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Brain className="w-4 h-4" /> Generate</>}
                    </button>

                    {aiGeneratedQuestions.length > 0 && !aiPublished && (
                      <div className="mt-3 space-y-3 border-t border-gray-700 pt-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Quiz Title</label>
                          <input value={aiQuizTitle} onChange={e => setAiQuizTitle(e.target.value)}
                            className="w-full p-2 bg-gray-800 rounded-lg border border-gray-700 text-sm text-white outline-none focus:border-purple-500" />
                        </div>
                        <p className="text-xs text-gray-400">{aiGeneratedQuestions.length} questions generated. Review below then publish.</p>
                        {aiGeneratedQuestions.map((q, qi) => (
                          <div key={qi} className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-xs space-y-2">
                            <p className="font-bold text-gray-200">{qi+1}. {q.question}</p>
                            {q.options.map((opt, oi) => (
                              <div key={oi} className={`flex items-center gap-2 px-2 py-1 rounded ${q.correctAnswerIndex === oi ? 'bg-green-900/30 border border-green-500/40' : 'bg-gray-900'}`}>
                                <button type="button" onClick={() => updateAICorrect(qi, oi)}
                                  className={`w-3 h-3 rounded-full border ${q.correctAnswerIndex === oi ? 'bg-green-500 border-green-500' : 'border-gray-600'}`} />
                                <span className="text-gray-300">{String.fromCharCode(65+oi)}. {opt}</span>
                                {q.correctAnswerIndex === oi && <span className="text-green-400 ml-auto">✓</span>}
                              </div>
                            ))}
                          </div>
                        ))}
                        <button type="button" onClick={handlePublishAIQuiz} disabled={aiPublishing}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                          {aiPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Publish to Course
                        </button>
                      </div>
                    )}

                    {aiPublished && (
                      <div className="flex items-center gap-2 bg-green-900/30 border border-green-500 rounded-lg p-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-bold text-sm">Quiz published successfully!</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-700 pt-4">
                <form onSubmit={handleAddQuiz} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-indigo-400">Create Timed Quiz</h3>
                  <div><label className="block text-sm text-gray-400 mb-1">Quiz Title</label><input type="text" required value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" placeholder="e.g. React Basics Test" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-400 mb-1">Time Limit (mins)</label><input type="number" required value={newQuiz.timeLimit} onChange={e => setNewQuiz({...newQuiz, timeLimit: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" placeholder="0 = No limit" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Module / Chapter</label><input type="text" value={newQuiz.module} onChange={e => setNewQuiz({...newQuiz, module: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <h4 className="font-bold text-lg mb-4 flex justify-between items-center">
                      Questions 
                      <button type="button" onClick={() => setQuizQuestions([...quizQuestions, { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 }])} className="text-sm bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-white">+ Add Question</button>
                    </h4>
                    {quizQuestions.map((q, index) => (
                      <div key={index} className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-4 relative">
                        {quizQuestions.length > 1 && (
                          <button type="button" onClick={() => {
                            const newQs = [...quizQuestions];
                            newQs.splice(index, 1);
                            setQuizQuestions(newQs);
                          }} className="absolute top-4 right-4 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        )}
                        <label className="block text-sm text-gray-400 mb-1">Question {index + 1}</label>
                        <input type="text" required value={q.question} onChange={e => {
                          const newQs = [...quizQuestions];
                          newQs[index].question = e.target.value;
                          setQuizQuestions(newQs);
                        }} className="w-full p-3 bg-black rounded-lg border border-gray-800 outline-none focus:border-indigo-500 mb-3" />
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx}>
                              <label className="block text-xs text-gray-500 mb-1">Option {optIdx + 1}</label>
                              <input type="text" required value={opt} onChange={e => {
                                const newQs = [...quizQuestions];
                                newQs[index].options[optIdx] = e.target.value;
                                setQuizQuestions(newQs);
                              }} className="w-full p-2 bg-black rounded-lg border border-gray-800 outline-none focus:border-indigo-500 text-sm" />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Correct Option</label>
                          <select required value={q.correctAnswerIndex} onChange={e => {
                            const newQs = [...quizQuestions];
                            newQs[index].correctAnswerIndex = e.target.value;
                            setQuizQuestions(newQs);
                          }} className="w-full p-2 bg-black rounded-lg border border-gray-800 outline-none focus:border-indigo-500 text-sm">
                            <option value={0}>Option 1</option>
                            <option value={1}>Option 2</option>
                            <option value={2}>Option 3</option>
                            <option value={3}>Option 4</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Save Full Quiz</button>
                </form>
                </div>
                </>
              )}

              {activeTab === 'assignments' && (
                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-indigo-400">Add Auto-Scored Assignment</h3>
                  <div><label className="block text-sm text-gray-400 mb-1">Assignment Title</label><input type="text" required value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Module / Chapter Name</label><input type="text" value={newAssignment.module} onChange={e => setNewAssignment({...newAssignment, module: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" placeholder="e.g. Chapter 1: Basics" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Description & Requirements (AI Graded)</label><textarea required value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 h-24" placeholder="Describe what the student needs to submit. The AI will grade their submission based on these instructions." /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Max Score</label><input type="number" required value={newAssignment.maxScore} onChange={e => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value)})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Add Assignment</button>
                </form>
              )}

              {activeTab === 'resources' && (
                <form onSubmit={handleAddResource} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-indigo-400">Add New Resource</h3>
                  <div><label className="block text-sm text-gray-400 mb-1">Title</label><input type="text" required value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Module / Chapter Name</label><input type="text" value={newResource.module} onChange={e => setNewResource({...newResource, module: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" placeholder="e.g. Chapter 1: Basics" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Resource URL (PDF/Link)</label><input type="url" required value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Add Resource</button>
                </form>
              )}

              {activeTab === 'problems' && (
                <form onSubmit={handleAddProblem} className="space-y-4">
                  <h3 className="font-bold text-xl mb-4 text-indigo-400">Add Coding Problem</h3>
                  <div><label className="block text-sm text-gray-400 mb-1">Problem Title</label><input type="text" required value={newProblem.title} onChange={e => setNewProblem({...newProblem, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Module / Chapter Name</label><input type="text" value={newProblem.module} onChange={e => setNewProblem({...newProblem, module: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" placeholder="e.g. Chapter 1: Basics" /></div>
                  <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea required value={newProblem.description} onChange={e => setNewProblem({...newProblem, description: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 h-24" /></div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Language</label>
                    <select required value={newProblem.language} onChange={e => setNewProblem({...newProblem, language: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500">
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div><label className="block text-sm text-gray-400 mb-1">Starter Code</label><textarea value={newProblem.starterCode} onChange={e => setNewProblem({...newProblem, starterCode: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 font-mono h-24" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-400 mb-1">Test Input</label><textarea required value={newProblem.testInput} onChange={e => setNewProblem({...newProblem, testInput: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 font-mono h-20" placeholder="e.g. 5 10" /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Expected Output</label><textarea required value={newProblem.expectedOutput} onChange={e => setNewProblem({...newProblem, expectedOutput: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 font-mono h-20" placeholder="e.g. 15" /></div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Add Problem</button>
                </form>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="lg:col-span-2 space-y-4">
             {activeTab === 'details' && (
               <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                 <h2 className="text-2xl font-bold mb-4">Course Preview</h2>
                 <img src={course.thumbnail} alt={course.title} className="w-full h-64 object-cover rounded-xl mb-4" />
                 <h3 className="text-xl font-bold">{course.title}</h3>
                 <p className="text-indigo-400 font-bold mb-4">${course.price === 0 ? "Free" : course.price}</p>
                 <p className="text-gray-300">{course.description}</p>
               </div>
             )}

             {activeTab === 'videos' && (
               <>
                 <h2 className="text-2xl font-bold mb-6">Current Videos ({(course.videos || []).length})</h2>
                 {(course.videos || []).length === 0 ? <p className="text-gray-500">No videos added yet.</p> : (course.videos || []).map((v, i) => (
                   <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col mb-3 relative group">
                     <button onClick={() => handleDeleteItem('videos', v._id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-700/50" title="Delete Video"><Trash2 className="w-5 h-5" /></button>
                     <h4 className="font-bold text-lg mb-1">{i + 1}. {v.title}</h4>
                     <p className="text-sm text-gray-400">{v.duration || 0} min • {v.videoUrl}</p>
                   </div>
                 ))}
               </>
             )}

             {activeTab === 'quizzes' && (
               <>
                 <h2 className="text-2xl font-bold mb-6">Current Quizzes ({(course.quizzes || []).length})</h2>
                 {(course.quizzes || []).length === 0 ? <p className="text-gray-500">No quizzes added yet.</p> : (course.quizzes || []).map((q, i) => (
                   <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-4 relative group">
                     <button onClick={() => handleDeleteItem('quizzes', q._id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-700/50" title="Delete Quiz"><Trash2 className="w-5 h-5" /></button>
                     <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-2 pr-8">
                       <h4 className="font-bold text-xl text-indigo-400">{q.title || "Legacy Quiz"}</h4>
                       <span className="text-sm bg-gray-900 px-3 py-1 rounded-full text-gray-400">
                         {q.timeLimit > 0 ? `${q.timeLimit} mins` : "No Time Limit"}
                       </span>
                     </div>
                     <div className="space-y-4">
                       {(q.questions || [{ question: q.question, options: q.options || [], correctAnswerIndex: q.correctAnswerIndex }]).map((question, qIdx) => (
                         <div key={qIdx} className="bg-gray-900/50 p-4 rounded-lg">
                           <p className="font-medium text-gray-200 mb-2">Q{qIdx + 1}: {question.question}</p>
                           <ul className="space-y-1 ml-2 text-sm text-gray-400 list-disc list-inside">
                             {(question.options || []).map((opt, optIndex) => (
                               <li key={optIndex} className={optIndex === question.correctAnswerIndex ? "text-green-400 font-bold" : ""}>
                                 {opt} {optIndex === question.correctAnswerIndex && "(Correct)"}
                               </li>
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </>
             )}

             {activeTab === 'assignments' && (
               <>
                 <h2 className="text-2xl font-bold mb-6">Current Assignments ({(course.assignments || []).length})</h2>
                 {(course.assignments || []).length === 0 ? <p className="text-gray-500">No assignments added yet.</p> : (course.assignments || []).map((a, i) => (
                   <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-4 flex justify-between items-start relative group">
                     <div className="pr-8">
                       <h4 className="font-bold text-xl text-indigo-400 mb-2">{a.title}</h4>
                       <p className="text-gray-300 text-sm mb-2">{a.description}</p>
                       <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Module: {a.module}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="bg-gray-900 px-4 py-2 rounded-lg text-center border border-gray-700">
                         <div className="text-xs text-gray-500">Max Score</div>
                         <div className="font-bold text-xl">{a.maxScore}</div>
                       </div>
                       <button onClick={() => handleDeleteItem('assignments', a._id)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-700/50" title="Delete Assignment"><Trash2 className="w-5 h-5" /></button>
                     </div>
                   </div>
                 ))}
               </>
             )}

             {activeTab === 'problems' && (
               <>
                 <h2 className="text-2xl font-bold mb-6">Current Problems ({(course.problems || []).length})</h2>
                 {(course.problems || []).length === 0 ? <p className="text-gray-500">No problems added yet.</p> : (course.problems || []).map((p, i) => (
                   <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-3 relative group">
                     <button onClick={() => handleDeleteItem('problems', p._id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-700/50" title="Delete Problem"><Trash2 className="w-5 h-5" /></button>
                     <h4 className="font-bold text-lg mb-1 pr-8">{p.title}</h4>
                     <p className="text-sm text-gray-400">{p.language.toUpperCase()} • {p.testCases.length} Test Cases</p>
                   </div>
                 ))}
               </>
             )}

             {activeTab === 'resources' && (
               <>
                 <h2 className="text-2xl font-bold mb-6">Current Resources ({(course.resources || []).length})</h2>
                 {(course.resources || []).length === 0 ? <p className="text-gray-500">No resources added yet.</p> : (course.resources || []).map((r, i) => (
                   <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-3 relative group">
                     <button onClick={() => handleDeleteItem('resources', r._id)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-gray-700/50" title="Delete Resource"><Trash2 className="w-5 h-5" /></button>
                     <h4 className="font-bold text-lg mb-1 pr-8">{r.title}</h4>
                     <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:underline break-all">{r.url}</a>
                   </div>
                 ))}
               </>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
