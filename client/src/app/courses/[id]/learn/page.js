"use client";
import { useEffect, useState, use } from "react";
import useCourseStore from "@/store/useCourseStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { PlayCircle, CheckCircle, MessageSquare, Code, Loader2, Send, FileCode2, HelpCircle, FileText, ExternalLink, Menu, X, ChevronLeft, Bot } from "lucide-react";
import axios from "axios";
import { Editor } from "@monaco-editor/react";

export default function LearnPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("video");
  const [code, setCode] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI learning assistant. Ask me any doubts about this lecture.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Mobile sidebar / panel state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'code' && course?.problems?.[activeProblemIndex]) {
      setCode(course.problems[activeProblemIndex].starterCode || "");
    }
  }, [activeProblemIndex, activeTab, course]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, router]);

  // Close mobile drawers when navigating
  const selectVideo = (index) => {
    setActiveVideoIndex(index);
    setActiveTab('video');
    setSidebarOpen(false);
  };
  
  const handleForceDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download file:', err);
      // Fallback: just open it in a new tab if CORS blocks the fetch
      window.open(url, '_blank');
    }
  };

  const selectProblem = (index) => {
    setActiveProblemIndex(index);
    setActiveTab('code');
    setSidebarOpen(false);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newChat = [...chatHistory, { role: 'user', content: chatMessage }];
    setChatHistory(newChat);
    setChatMessage("");
    setAiLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/ai/doubt`, {
        question: chatMessage,
        context: course.title + " - " + (course.videos[activeVideoIndex]?.title || "")
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setChatHistory([...newChat, { role: 'assistant', content: res.data.answer }]);
    } catch (err) {
      setChatHistory([...newChat, { role: 'assistant', content: "Sorry, I am having trouble connecting to the AI service right now." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleVideoComplete = async () => {
    if (!activeVideo?._id) return;
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses/${id}/progress`, { videoId: activeVideo._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const updatedUser = { ...user };
      const progIdx = updatedUser.progress.findIndex(p => p.courseId === id || p.courseId?._id === id);
      if (progIdx > -1) updatedUser.progress[progIdx] = res.data.progress;
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) { console.error(err); }
  };

  const handleRunCode = async () => {
    const problem = course.problems?.[activeProblemIndex];
    if (!problem || !problem.testCases || problem.testCases.length === 0) return;
    setIsExecuting(true);
    setTestResults(null);
    try {
      const results = [];
      for (const tc of problem.testCases) {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/code/execute`, {
          language: problem.language, code, stdin: tc.input
        });
        const output = (res.data.output || '').trim();
        const passed = output === tc.expectedOutput.trim();
        results.push({ input: tc.input, expected: tc.expectedOutput, actual: output, passed });
      }
      setTestResults(results);
      if (results.every(r => r.passed)) {
        try {
          const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses/${id}/progress`, { solvedProblem: problem._id }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const updatedUser = { ...user };
          const progIdx = updatedUser.progress.findIndex(p => p.courseId === id || p.courseId?._id === id);
          if (progIdx > -1) updatedUser.progress[progIdx] = res.data.progress;
          if (res.data.codingScore !== undefined) updatedUser.codingScore = res.data.codingScore;
          useAuthStore.setState({ user: updatedUser });
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) { console.error("Failed to update progress:", err); }
      }
    } catch (err) {
      console.error(err);
      alert("Error executing code. The execution service might be down.");
    } finally { setIsExecuting(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!course) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Course not found</div>;

  const activeVideo = course.videos && course.videos.length > 0 ? course.videos[activeVideoIndex] : null;
  const userProgress = user?.progress?.find(p => p.courseId === id || p.courseId?._id === id);

  // Build modules map
  const modulesMap = {};
  (course.videos || []).forEach((v, i) => {
    const mod = v.module || 'General';
    if (!modulesMap[mod]) modulesMap[mod] = { videos: [], problems: [] };
    modulesMap[mod].videos.push({ ...v, originalIndex: i });
  });
  (course.problems || []).forEach((p, i) => {
    const mod = p.module || 'General';
    if (!modulesMap[mod]) modulesMap[mod] = { videos: [], problems: [] };
    modulesMap[mod].problems.push({ ...p, originalIndex: i });
  });

  const SidebarContent = () => (
    <>
      {Object.entries(modulesMap).map(([moduleName, items]) => (
        <div key={moduleName} className="mb-2">
          <div className="p-3 border-y border-gray-800 font-bold bg-gray-900 sticky top-0 z-10 text-indigo-400 uppercase tracking-wider text-xs">
            {moduleName}
          </div>
          <div className="flex-none">
            {items.videos.map((v) => (
              <button
                key={`video-${v.originalIndex}`}
                onClick={() => selectVideo(v.originalIndex)}
                className={`w-full text-left p-4 flex gap-3 border-b border-gray-800 transition-colors ${activeTab === 'video' && activeVideoIndex === v.originalIndex ? 'bg-indigo-900/30 border-l-4 border-l-indigo-500' : 'hover:bg-gray-800'}`}
              >
                <div className="mt-0.5 shrink-0">
                  {userProgress?.completedVideos?.includes(v._id)
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <PlayCircle className={`w-5 h-5 ${activeTab === 'video' && activeVideoIndex === v.originalIndex ? 'text-indigo-400' : 'text-gray-500'}`} />}
                </div>
                <div>
                  <div className={`font-medium text-sm ${activeTab === 'video' && activeVideoIndex === v.originalIndex ? 'text-indigo-300' : 'text-gray-300'}`}>{v.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{v.duration || 0} min</div>
                </div>
              </button>
            ))}
            {items.problems.map((p) => (
              <button
                key={`problem-${p.originalIndex}`}
                onClick={() => selectProblem(p.originalIndex)}
                className={`w-full text-left p-4 flex gap-3 border-b border-gray-800 transition-colors ${activeTab === 'code' && activeProblemIndex === p.originalIndex ? 'bg-indigo-900/30 border-l-4 border-l-indigo-500' : 'hover:bg-gray-800'}`}
              >
                <div className="mt-0.5 shrink-0">
                  <Code className={`w-5 h-5 ${activeTab === 'code' && activeProblemIndex === p.originalIndex ? 'text-indigo-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className={`font-medium text-sm ${activeTab === 'code' && activeProblemIndex === p.originalIndex ? 'text-indigo-300' : 'text-gray-300'}`}>{p.title}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase">{p.language}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quizzes Section */}
      {(course?.quizzes || []).length > 0 && (
        <div className="mb-2">
          <div className="p-3 border-y border-gray-800 font-bold bg-gray-900 sticky top-0 z-10 text-yellow-500 uppercase tracking-wider text-xs flex items-center gap-2">
            <HelpCircle className="w-3 h-3" /> Quizzes
          </div>
          {(course.quizzes || []).map((quiz, i) => {
            const isCompleted = userProgress?.completedQuizzes?.includes(quiz._id?.toString());
            return (
              <button
                key={`quiz-${i}`}
                onClick={() => { router.push(`/courses/${id}/learn/quiz/${quiz._id}`); setSidebarOpen(false); }}
                className="w-full text-left p-4 flex gap-3 border-b border-gray-800 hover:bg-gray-800 transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted
                    ? <CheckCircle className="w-5 h-5 text-green-500" />
                    : <HelpCircle className="w-5 h-5 text-yellow-500/70" />}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-300">{quiz.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {quiz.questions?.length || 0} questions
                    {quiz.timeLimit > 0 ? ` • ${quiz.timeLimit} min` : ' • No time limit'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {(!course?.videos?.length && !course?.problems?.length && !course?.quizzes?.length) && (
        <div className="p-4 text-gray-500 text-sm">No course content available.</div>
      )}
    </>
  );

  const AiPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between font-bold text-indigo-400">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> AI Doubt Assistant
        </div>
        <button onClick={() => setAiPanelOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-300 border border-gray-700 rounded-tl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {aiLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 p-3 rounded-xl border border-gray-700 rounded-tl-none text-sm flex gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <form onSubmit={handleSendChat} className="flex gap-2 relative">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask your doubt..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button type="submit" disabled={!chatMessage.trim() || aiLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 rounded-lg text-white transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white p-1 shrink-0"
            aria-label="Open course content"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => router.push("/student/dashboard")} className="text-gray-400 hover:text-white flex items-center gap-1 shrink-0 text-sm">
            <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span>
          </button>
          <h1 className="font-bold text-sm md:text-lg truncate">{course.title}</h1>
        </div>
        {/* Mobile AI toggle */}
        <button
          onClick={() => setAiPanelOpen(true)}
          className="lg:hidden text-indigo-400 hover:text-indigo-300 p-1 shrink-0"
          aria-label="Open AI assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">

        {/* === MOBILE SIDEBAR OVERLAY === */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto z-50 transition-transform duration-300
          lg:relative lg:translate-x-0 lg:w-80 lg:shrink-0 lg:z-auto lg:h-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-gray-800 lg:hidden">
            <span className="font-bold text-indigo-400 text-sm uppercase tracking-wider">Course Content</span>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <SidebarContent />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-black overflow-y-auto relative min-w-0">
          {activeVideo ? (
            <div className="flex-1 flex flex-col">
              {/* Tab Bar */}
              <div className="bg-gray-900 border-b border-gray-800 p-2 flex gap-1 overflow-x-auto shrink-0">
                {[
                  { key: 'video', icon: <PlayCircle className="w-4 h-4" />, label: 'Video' },
                  { key: 'code', icon: <FileCode2 className="w-4 h-4" />, label: 'Code' },
                  { key: 'quiz', icon: <HelpCircle className="w-4 h-4" />, label: 'Quizzes' },
                  { key: 'assignment', icon: <FileText className="w-4 h-4" />, label: 'Assignments' },
                  { key: 'resource', icon: <ExternalLink className="w-4 h-4" />, label: 'Resources' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                  >
                    {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'video' ? (
                <>
                  <div className="w-full aspect-video bg-black flex items-center justify-center relative border-b border-gray-800">
                    {activeVideo.videoUrl ? (
                      activeVideo.videoUrl.includes('youtube.com') || activeVideo.videoUrl.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${activeVideo.videoUrl.includes('youtu.be/') ? activeVideo.videoUrl.split('youtu.be/')[1]?.split('?')[0] : new URL(activeVideo.videoUrl).searchParams.get('v')}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video src={activeVideo.videoUrl} controls onEnded={handleVideoComplete} className="w-full h-full" />
                      )
                    ) : (
                      <div className="text-center text-gray-500">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Video Source Not Available</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-8 max-w-4xl w-full mx-auto">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <h2 className="text-xl sm:text-2xl font-bold">{activeVideo.title}</h2>
                      {!userProgress?.completedVideos?.includes(activeVideo._id) && (
                        <button
                          onClick={handleVideoComplete}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shrink-0 self-start"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark as Complete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-400 leading-relaxed">{activeVideo.description || "No description provided for this lecture."}</p>
                  </div>
                </>
              ) : activeTab === 'code' && course.problems?.[activeProblemIndex] ? (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  {/* Problem Description */}
                  <div className="lg:w-1/3 bg-gray-900 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto max-h-64 lg:max-h-none">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">{course.problems[activeProblemIndex].title}</h2>
                    <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">{course.problems[activeProblemIndex].language}</span>
                    <p className="mt-4 text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{course.problems[activeProblemIndex].description}</p>
                    {course.problems[activeProblemIndex].testCases?.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h3 className="font-bold border-b border-gray-700 pb-2 text-sm">Example Cases</h3>
                        {course.problems[activeProblemIndex].testCases.map((tc, idx) => (
                          <div key={idx} className="bg-gray-800 p-3 rounded-lg border border-gray-700 text-sm">
                            <div className="font-bold text-gray-400 mb-1">Input:</div>
                            <div className="font-mono text-gray-200 bg-black p-2 rounded mb-2">{tc.input}</div>
                            <div className="font-bold text-gray-400 mb-1">Expected Output:</div>
                            <div className="font-mono text-gray-200 bg-black p-2 rounded">{tc.expectedOutput}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {testResults && (
                      <div className="mt-6 space-y-3">
                        <h3 className="font-bold border-b border-gray-700 pb-2 text-sm">Test Results</h3>
                        {testResults.every(tr => tr.passed) && (
                          <div className="p-3 bg-green-900/30 border border-green-500 rounded-xl flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                            <div>
                              <div className="font-bold text-green-400 text-sm">All tests passed!</div>
                              <div className="text-xs text-green-300/80">+10 Points added</div>
                            </div>
                          </div>
                        )}
                        {testResults.map((tr, i) => (
                          <div key={i} className={`p-3 rounded-lg border text-xs ${tr.passed ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                            <div className={`font-bold mb-1 ${tr.passed ? 'text-green-400' : 'text-red-400'}`}>Test {i + 1}: {tr.passed ? 'Passed ✓' : 'Failed ✗'}</div>
                            <div className="font-mono text-gray-400">Input: {tr.input}</div>
                            {!tr.passed && <>
                              <div className="font-mono text-gray-400">Expected: {tr.expected}</div>
                              <div className="font-mono text-red-300">Actual: {tr.actual}</div>
                            </>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Code Editor */}
                  <div className="flex-1 flex flex-col min-h-64 lg:min-h-0">
                    <div className="flex-1 overflow-hidden" style={{ minHeight: '300px' }}>
                      <Editor
                        height="100%"
                        language={course.problems[activeProblemIndex].language === 'cpp' ? 'cpp' : course.problems[activeProblemIndex].language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val)}
                        options={{ minimap: { enabled: false }, fontSize: 14 }}
                      />
                    </div>
                    <div className="bg-gray-900 p-3 sm:p-4 border-t border-gray-800 flex justify-end">
                      <button onClick={handleRunCode} disabled={isExecuting} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-6 sm:px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                        {isExecuting ? 'Running...' : 'Run Code'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'code' ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">No coding problems available for this course.</div>
              ) : activeTab === 'quiz' ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-900">
                  <h2 className="text-xl sm:text-2xl font-bold mb-6">Course Quizzes</h2>
                  {!course.quizzes?.length ? (
                    <p className="text-gray-400">No quizzes available for this course.</p>
                  ) : (
                    <div className="space-y-4">
                      {course.quizzes.map((q, i) => {
                        const quizScore = userProgress?.quizScores?.find(qs => qs.quizId === q._id);
                        return (
                          <div key={i} className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                              <h3 className="text-lg sm:text-xl font-bold text-indigo-400 mb-1">{q.title || "Legacy Quiz"}</h3>
                              <div className="text-sm text-gray-400">{(q.questions || [{}]).length} Questions • {q.timeLimit > 0 ? `${q.timeLimit} Minutes` : "No Time Limit"}</div>
                              {quizScore && <div className="text-sm font-bold text-green-400 mt-1">Highest Score: {quizScore.score}%</div>}
                            </div>
                            <button
                              onClick={() => router.push(`/courses/${id}/learn/quiz/${q._id}`)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors w-full sm:w-auto"
                            >
                              {quizScore ? "Retake Quiz" : "Start Quiz"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === 'assignment' ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-900">
                  <h2 className="text-xl sm:text-2xl font-bold mb-6">AI Graded Assignments</h2>
                  {!course.assignments?.length ? (
                    <p className="text-gray-400">No assignments available for this course.</p>
                  ) : (
                    <div className="space-y-6 sm:space-y-8">
                      {course.assignments.map((a, i) => {
                        const scoreData = userProgress?.assignmentScores?.find(as => as.assignmentId === a._id);
                        return (
                          <div key={i} className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-indigo-400">{a.title}</h3>
                                <div className="text-sm bg-gray-900 px-3 py-1 rounded-full text-gray-400 mt-2 inline-block">Module: {a.module}</div>
                              </div>
                              <div className="text-left sm:text-right shrink-0">
                                <div className="text-sm text-gray-400">Max Score</div>
                                <div className="font-bold text-xl">{a.maxScore}</div>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4 text-sm sm:text-base">{a.description}</p>
                            {scoreData ? (
                              <div className="bg-green-900/20 border border-green-800 p-4 rounded-xl">
                                <h4 className="font-bold text-green-400 mb-1">Assignment Graded</h4>
                                <div className="text-3xl font-bold text-white">{scoreData.score} / {a.maxScore}</div>
                              </div>
                            ) : (
                              <form onSubmit={async (e) => {
                                e.preventDefault();
                                const submissionText = e.target.submission.value;
                                if (!submissionText.trim()) return;
                                try {
                                  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses/${id}/assignments/${a._id}/submit`, { submissionText }, {
                                    headers: { Authorization: `Bearer ${user.token}` }
                                  });
                                  alert(`Assignment Graded! Score: ${res.data.score}/${res.data.maxScore}\nFeedback: ${res.data.feedback}`);
                                  const updatedUser = { ...user };
                                  const progIdx = updatedUser.progress.findIndex(p => p.courseId === id || p.courseId?._id === id);
                                  if (progIdx > -1) {
                                    if (!updatedUser.progress[progIdx].assignmentScores) updatedUser.progress[progIdx].assignmentScores = [];
                                    updatedUser.progress[progIdx].assignmentScores.push({ assignmentId: a._id, score: res.data.score });
                                  }
                                  useAuthStore.setState({ user: updatedUser });
                                  localStorage.setItem("user", JSON.stringify(updatedUser));
                                } catch (err) { alert("Error submitting assignment"); }
                              }}>
                                <label className="block text-sm text-gray-400 mb-2">Your Submission</label>
                                <textarea name="submission" required rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-200 outline-none focus:border-indigo-500 mb-4 text-sm" placeholder="Type your answer, report, or code here..." />
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors w-full flex items-center justify-center gap-2">
                                  <Send className="w-5 h-5" /> Submit for AI Grading
                                </button>
                              </form>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === 'resource' ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-900">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Course Resources</h2>
                  <p className="text-gray-400 text-sm mb-6">Click <span className="text-indigo-400 font-semibold">Open Resource</span> to view online, or <span className="text-green-400 font-semibold">Download</span> to save to your device.</p>
                  {!course.resources?.length ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-gray-800/40 rounded-2xl border border-dashed border-gray-700 text-gray-500">
                      <FileText className="w-12 h-12 mb-3 opacity-50" />
                      <p>No resources available for this course yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {course.resources.map((r, i) => (
                        <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-indigo-500/40 transition-all overflow-hidden group">
                          <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-5 flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <FileText className="w-7 h-7 text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-lg text-white truncate">{r.title}</h3>
                              {r.module && <p className="text-xs text-gray-400 mt-0.5">Module: {r.module}</p>}
                            </div>
                          </div>
                          <div className="p-4 flex gap-3">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition"
                            >
                              <ExternalLink className="w-4 h-4" /> Open Resource
                            </a>
                            <button
                              onClick={() => handleForceDownload(r.url, r.title || 'course-resource')}
                              className="flex items-center justify-center gap-1.5 bg-green-700/30 hover:bg-green-600 border border-green-600/40 text-green-400 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition"
                              title="Download"
                            >
                              ⬇ Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-8 text-center">
              <div>
                <PlayCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p>Select a lesson from the menu to start learning.</p>
                <button onClick={() => setSidebarOpen(true)} className="mt-4 lg:hidden bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto">
                  <Menu className="w-4 h-4" /> Open Course Content
                </button>
              </div>
            </div>
          )}
        </div>

        {/* === MOBILE AI PANEL OVERLAY === */}
        {aiPanelOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setAiPanelOpen(false)}
          />
        )}

        {/* Right Sidebar - AI Assistant */}
        <div className={`
          fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-50 transition-transform duration-300
          lg:relative lg:translate-x-0 lg:w-96 lg:shrink-0 lg:z-auto lg:h-auto
          ${aiPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <AiPanel />
        </div>

      </div>
    </div>
  );
}
