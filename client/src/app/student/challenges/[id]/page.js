"use client";
import { useEffect, useState, use } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, PlayCircle, CheckCircle, Code, Award } from "lucide-react";
import axios from "axios";
import { Editor } from "@monaco-editor/react";
import Link from "next/link";

export default function ChallengeWorkspace({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchChallenge = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/challenges/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setChallenge(res.data);
        setCode(res.data.starterCode || "");
        if (user?.solvedChallenges?.includes(id)) {
          setSuccess(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id, user, router]);

  const handleRunCode = async () => {
    if (!challenge || !challenge.testCases || challenge.testCases.length === 0) return;
    
    setIsExecuting(true);
    setTestResults(null);
    try {
      const results = [];
      for (const tc of challenge.testCases) {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/code/execute`, {
          language: challenge.language,
          code: code,
          stdin: tc.input
        });
        
        const output = (res.data.output || '').trim();
        const passed = output === tc.expectedOutput.trim();
        results.push({ input: tc.input, expected: tc.expectedOutput, actual: output, passed });
      }
      setTestResults(results);

      // If all test cases passed, submit
      if (results.every(r => r.passed) && !success) {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/challenges/${id}/submit`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const updatedUser = { ...user };
          updatedUser.codingScore = res.data.codingScore;
          updatedUser.solvedChallenges = res.data.solvedChallenges;
          useAuthStore.setState({ user: updatedUser });
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setSuccess(true);
        } catch (err) {
          console.error("Failed to update score:", err);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error executing code.");
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!challenge) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Challenge not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link href="/student/challenges" className="text-gray-400 hover:text-white shrink-0 text-sm">&larr; Back</Link>
          <h1 className="font-bold text-sm md:text-lg flex items-center gap-2 truncate"><Code className="text-indigo-400 w-4 h-4 shrink-0" /> {challenge.title}</h1>
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded shrink-0">{challenge.language}</span>
          <span className={`hidden sm:inline text-xs font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 ${challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
            {challenge.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
           {success && <div className="text-xs md:text-sm text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Solved</div>}
           <div className="text-xs md:text-sm text-gray-400"><Award className="w-4 h-4 inline mb-1" /> {challenge.points} pts</div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Description & Tests */}
        <div className="lg:w-1/3 bg-gray-900 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto max-h-48 lg:max-h-none">
          <h2 className="text-xl font-bold mb-4">Problem Description</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-8">{challenge.description}</p>
          
          {challenge.testCases && challenge.testCases.length > 0 && (
            <div className="mb-8 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-bold text-sm text-gray-400 mb-3 uppercase tracking-wider">Example Test Case</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Input</div>
                  <div className="bg-black p-2 rounded text-sm font-mono text-gray-300">{challenge.testCases[0].input}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Expected Output</div>
                  <div className="bg-black p-2 rounded text-sm font-mono text-gray-300">{challenge.testCases[0].expectedOutput}</div>
                </div>
              </div>
            </div>
          )}
          
          {testResults && (
            <div className="mt-8 space-y-4">
              <h3 className="font-bold border-b border-gray-700 pb-2">Test Results</h3>
              {testResults.length > 0 && testResults.every(tr => tr.passed) && (
                <div className="p-4 bg-green-900/30 border border-green-500 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="font-bold text-green-400">All tests passed!</div>
                    <div className="text-sm text-green-300/80">+{challenge.points} Points added to your Coding Score</div>
                  </div>
                </div>
              )}
              {testResults.map((tr, i) => (
                <div key={i} className={`p-3 rounded-lg border ${tr.passed ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                  <div className={`font-bold text-sm mb-2 ${tr.passed ? 'text-green-400' : 'text-red-400'}`}>Test Case {i + 1}: {tr.passed ? 'Passed' : 'Failed'}</div>
                  <div className="text-xs font-mono text-gray-400 mb-1">Input: {tr.input}</div>
                  {!tr.passed && (
                    <>
                      <div className="text-xs font-mono text-gray-400 mb-1">Expected: {tr.expected}</div>
                      <div className="text-xs font-mono text-red-300">Actual: {tr.actual}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Side: Code Editor */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={challenge.language === 'cpp' ? 'cpp' : challenge.language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val)}
              options={{ minimap: { enabled: false }, fontSize: 14 }}
            />
          </div>
          <div className="bg-gray-900 p-4 border-t border-gray-800 flex justify-end">
            <button onClick={handleRunCode} disabled={isExecuting} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
              {isExecuting ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
