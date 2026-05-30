"use client";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, Code, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function ChallengesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchChallenges = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/challenges`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setChallenges(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [user, router]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <Link href="/student/dashboard" className="text-gray-400 hover:text-white mb-2 inline-flex items-center gap-1 text-sm">&larr; Back to Dashboard</Link>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mt-1"><Code className="text-indigo-400" /> Practice Challenges</h1>
            <p className="text-gray-400 mt-1 text-sm">Solve problems, pass test cases, and increase your coding score.</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-5 py-3 rounded-xl flex items-center gap-4 self-start sm:self-auto shrink-0">
            <div className="text-gray-400 text-sm">Coding Score</div>
            <div className="text-2xl font-bold text-indigo-400">{user?.codingScore || 0}</div>
          </div>
        </div>

        {challenges.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
            <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Challenges Available</h3>
            <p className="text-gray-400">Instructors haven't posted any global challenges yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map(challenge => {
              const isSolved = user?.solvedChallenges?.includes(challenge._id);
              return (
                <Link key={challenge._id} href={`/student/challenges/${challenge._id}`} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">
                      {challenge.language}
                    </span>
                    {isSolved && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{challenge.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 flex-grow mb-6">{challenge.description}</p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-700 mt-auto">
                    <div className="flex gap-3 text-sm font-medium">
                      <span className={`${challenge.difficulty === 'Easy' ? 'text-green-400' : challenge.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-indigo-300">{challenge.points} Points</span>
                    </div>
                    <ArrowRight className={`w-5 h-5 ${isSolved ? 'text-green-500' : 'text-gray-500 group-hover:text-indigo-400'}`} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
