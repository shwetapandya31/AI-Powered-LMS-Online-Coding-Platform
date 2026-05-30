'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';
import { Video, Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LiveClassesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/live-classes`);
        setClasses(res.data);
      } catch (err) {
        console.error('Error fetching live classes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-800">
          <Link href="/student/dashboard" className="text-gray-400 hover:text-white flex items-center gap-1 text-sm transition">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="text-red-500 w-8 h-8" /> Live Classes
            </h1>
            <p className="text-gray-400 mt-1">Join interactive sessions with your instructors in real-time.</p>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/40 rounded-2xl border border-dashed border-gray-700 text-gray-500">
            <Video className="w-14 h-14 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No live classes scheduled yet.</p>
            <p className="text-sm mt-1">Check back soon for upcoming sessions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes
              .filter(cls => {
                const scheduledTime = new Date(cls.scheduledAt).getTime();
                const now = new Date().getTime();
                // Show if it's in the future OR started less than 3 hours ago
                return scheduledTime > now || (now - scheduledTime) < (3 * 60 * 60 * 1000);
              })
              .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
              .map((cls) => {
                // Determine if it's currently live (started less than 3 hours ago and not in future)
                const isLive = new Date(cls.scheduledAt).getTime() <= new Date().getTime();
                
                return (
                  <div
                    key={cls._id}
                    className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group"
                  >
                    {/* Status Banner */}
                    <div className={`h-1.5 w-full ${isLive ? 'bg-red-500' : 'bg-indigo-700'}`} />

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg group-hover:text-indigo-400 transition line-clamp-1">{cls.title}</h3>
                        {isLive ? (
                          <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full border border-red-500/30 animate-pulse shrink-0 ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> LIVE
                          </span>
                        ) : (
                          <span className="bg-yellow-500/10 text-yellow-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-yellow-500/20 shrink-0 ml-2">
                            SCHEDULED
                          </span>
                        )}
                      </div>

                      <p className="text-gray-400 text-sm mb-5 line-clamp-2">{cls.description}</p>

                      <div className="space-y-2 text-sm text-gray-400 mb-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>By <span className="text-gray-200 font-medium">{cls.instructor?.name || 'TBA'}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{new Date(cls.scheduledAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/student/live-classes/${cls._id}`)}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                          isLive
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Video className="w-4 h-4" />
                        {isLive ? 'Join Now' : 'Enter Room'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
