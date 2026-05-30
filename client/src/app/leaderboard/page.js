'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/leaderboard');
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching leaderboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold flex items-center justify-center gap-3">
            <Trophy className="text-yellow-500 w-10 h-10" /> Global Leaderboard
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">See how you rank against other students!</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/50">
                <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-300">Rank</th>
                <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-300">Student</th>
                <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-300">Coding Score</th>
                <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-300">Points</th>
                <th className="p-4 font-semibold text-zinc-600 dark:text-zinc-300">Badges</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id} className="border-t border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
                  <td className="p-4 font-bold">
                    {index === 0 && <Medal className="text-yellow-500 inline mr-2" />}
                    {index === 1 && <Medal className="text-gray-400 inline mr-2" />}
                    {index === 2 && <Medal className="text-amber-600 inline mr-2" />}
                    #{index + 1}
                  </td>
                  <td className="p-4 font-medium text-lg">{user.name}</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-semibold">{user.codingScore}</td>
                  <td className="p-4 text-blue-600 dark:text-blue-400 font-semibold">{user.points}</td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {user.badges && user.badges.length > 0 ? (
                        user.badges.map((badge, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                            <Award className="w-3 h-3" />
                            {badge.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-zinc-400">No badges yet</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-zinc-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
