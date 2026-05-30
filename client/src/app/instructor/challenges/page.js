"use client";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2, Code } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function ManageChallenges() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newChallenge, setNewChallenge] = useState({
    title: "", description: "", language: "javascript", difficulty: "Medium", points: 10, testInput: "", expectedOutput: "", starterCode: ""
  });

  const fetchChallenges = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/challenges", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setChallenges(res.data);
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
    fetchChallenges();
  }, [user, router]);

  const handleAddChallenge = async (e) => {
    e.preventDefault();
    const formattedChallenge = {
      title: newChallenge.title,
      description: newChallenge.description,
      language: newChallenge.language,
      difficulty: newChallenge.difficulty,
      points: Number(newChallenge.points),
      starterCode: newChallenge.starterCode,
      testCases: [{ input: newChallenge.testInput, expectedOutput: newChallenge.expectedOutput }]
    };

    try {
      await axios.post("http://localhost:5000/api/challenges", formattedChallenge, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewChallenge({ title: "", description: "", language: "javascript", difficulty: "Medium", points: 10, testInput: "", expectedOutput: "", starterCode: "" });
      fetchChallenges();
      alert("Challenge added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding challenge");
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/challenges/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchChallenges();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting challenge");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/instructor/dashboard" className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-1 text-sm">&larr; Back to Dashboard</Link>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2"><Code className="text-indigo-400" /> Manage Global Challenges</h1>
            <p className="text-gray-400 mt-1 text-sm">Create coding challenges for students to practice.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-700 lg:sticky lg:top-8">
              <h3 className="font-bold text-xl mb-4 text-indigo-400">Add New Challenge</h3>
              <form onSubmit={handleAddChallenge} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input type="text" required value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Language</label>
                  <select value={newChallenge.language} onChange={e => setNewChallenge({...newChallenge, language: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500">
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                    <select value={newChallenge.difficulty} onChange={e => setNewChallenge({...newChallenge, difficulty: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Points</label>
                    <input type="number" required value={newChallenge.points} onChange={e => setNewChallenge({...newChallenge, points: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea required value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 h-24" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Starter Code (Optional)</label>
                  <textarea value={newChallenge.starterCode} onChange={e => setNewChallenge({...newChallenge, starterCode: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 font-mono h-24 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Test Input</label>
                    <textarea required value={newChallenge.testInput} onChange={e => setNewChallenge({...newChallenge, testInput: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 font-mono h-20 text-sm" placeholder="e.g. 5 10" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Expected Output</label>
                    <textarea required value={newChallenge.expectedOutput} onChange={e => setNewChallenge({...newChallenge, expectedOutput: e.target.value})} className="w-full p-3 bg-gray-900 rounded-lg border border-gray-700 outline-none focus:border-indigo-500 font-mono h-20 text-sm" placeholder="e.g. 15" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Publish Challenge</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
             <h2 className="text-2xl font-bold mb-6">Existing Challenges ({challenges.length})</h2>
             {challenges.length === 0 ? <p className="text-gray-500">No challenges created yet.</p> : challenges.map((c, i) => (
               <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h4 className="font-bold text-xl">{c.title}</h4>
                     <div className="flex gap-2 mt-2">
                       <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded uppercase tracking-wider">{c.language}</span>
                       <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${c.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : c.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{c.difficulty}</span>
                       <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase tracking-wider">{c.points} PTS</span>
                     </div>
                   </div>
                   <button onClick={() => handleDeleteChallenge(c._id)} className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-700" title="Delete Challenge">
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </div>
                 <p className="text-gray-400 text-sm mb-4 line-clamp-2">{c.description}</p>
                 <div className="bg-gray-900 p-3 rounded font-mono text-xs text-gray-300 mb-2 overflow-x-auto">
                   <span className="text-gray-500">Input:</span> {c.testCases?.[0]?.input}<br/>
                   <span className="text-gray-500">Expected:</span> {c.testCases?.[0]?.expectedOutput}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
