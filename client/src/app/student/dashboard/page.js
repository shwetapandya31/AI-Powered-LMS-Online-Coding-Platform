"use client";
import useAuthStore from "@/store/useAuthStore";
import useCourseStore from "@/store/useCourseStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Award, CheckCircle, PlayCircle, Loader2, Code, Brain, Trophy, Bell, Heart, MessageSquare, Star, Video } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StudentDashboard() {
  const { user, logout, wishlist, toggleWishlist, fetchWishlist } = useAuthStore();
  const { courses, fetchCourses } = useCourseStore();
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('learning'); // 'learning' | 'wishlist'
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wishlistFull, setWishlistFull] = useState([]);

  useEffect(() => {
    setMounted(true);
    if (!user || user.role !== 'student') {
      router.push("/login");
      return;
    }
    fetchCourses();
    fetchWishlist();
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const updatedUser = { ...user, progress: res.data.progress, codingScore: res.data.codingScore, points: res.data.points, badges: res.data.badges };
        useAuthStore.setState({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/notifications', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setNotifications(res.data);
      } catch (e) { console.error(e); }
    };
    fetchProfile();
    fetchNotifs();
  }, [user?.token, router]);

  if (!mounted || loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!user) return null;

  // Mock enrolled courses until we implement the enroll API
  const enrolledCourses = user.progress || [];
  
  // Calculate unenrolled courses
  const enrolledCourseIds = new Set(enrolledCourses.map(p => p.courseId?._id));
  const unenrolledCourses = courses ? courses.filter(c => !enrolledCourseIds.has(c._id)) : [];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/users/notifications/read', {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { console.error(e); }
  };

  const BADGE_INFO = {
    first_course: { label: 'First Course', icon: '🏅', color: 'from-yellow-500 to-amber-600' },
    quiz_master: { label: 'Quiz Master', icon: '🧠', color: 'from-blue-500 to-indigo-600' },
    code_ninja: { label: 'Code Ninja', icon: '⚡', color: 'from-purple-500 to-pink-600' },
    fast_learner: { label: 'Fast Learner', icon: '🚀', color: 'from-green-500 to-emerald-600' },
    completionist: { label: 'Completionist', icon: '🏆', color: 'from-orange-500 to-red-600' },
    top_10: { label: 'Top 10', icon: '⭐', color: 'from-yellow-400 to-yellow-600' },
    streak_7: { label: '7-Day Streak', icon: '🔥', color: 'from-red-500 to-orange-600' },
    forum_contributor: { label: 'Forum Hero', icon: '💬', color: 'from-teal-500 to-cyan-600' },
  };

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Prepare data for quiz scores chart
  const quizChartData = enrolledCourses.map((progressItem, index) => {
    const course = progressItem.courseId;
    if (!course) return null;
    
    let avgScore = 0;
    if (progressItem.quizScores && progressItem.quizScores.length > 0) {
      const sum = progressItem.quizScores.reduce((acc, curr) => acc + curr.score, 0);
      avgScore = Math.round(sum / progressItem.quizScores.length);
    }
    
    return {
      name: course.title.substring(0, 15) + (course.title.length > 15 ? '...' : ''),
      fullTitle: course.title,
      score: avgScore,
      fill: COLORS[index % COLORS.length]
    };
  }).filter(Boolean);

  // Prepare data for completion distribution
  let totalVideos = 0, totalProblems = 0, totalQuizzes = 0;
  let completedVids = 0, completedProbs = 0, completedQuiz = 0;

  enrolledCourses.forEach(p => {
    if (p.courseId) {
      totalVideos += p.courseId.videos?.length || 0;
      totalProblems += p.courseId.problems?.length || 0;
      totalQuizzes += p.courseId.quizzes?.length || 0;
      completedVids += p.completedVideos?.length || 0;
      completedProbs += p.solvedProblems?.length || 0;
      completedQuiz += p.completedQuizzes?.length || 0;
    }
  });

  const completionData = [
    { name: 'Videos', completed: completedVids, remaining: Math.max(0, totalVideos - completedVids) },
    { name: 'Problems', completed: completedProbs, remaining: Math.max(0, totalProblems - completedProbs) },
    { name: 'Quizzes', completed: completedQuiz, remaining: Math.max(0, totalQuizzes - completedQuiz) }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('dashboard')}</h1>
            <p className="text-gray-400 mt-1">{t('welcomeBack')}, {user.name}!</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) markAllRead(); }}
                className="relative p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h4 className="font-bold">Notifications</h4>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center p-6">No notifications yet.</p>
                    ) : notifications.map((n, i) => (
                      <div key={i} className={`p-3 border-b border-gray-700/50 flex gap-3 items-start ${!n.read ? 'bg-indigo-500/10' : ''}`}>
                        <span className="text-lg">{n.type === 'achievement' ? '🏆' : n.type === 'success' ? '✅' : '🔔'}</span>
                        <p className="text-sm text-gray-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/leaderboard" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors" title="Leaderboard">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </Link>
            <Link href="/forum" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors" title="Forum">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </Link>
            <Link href="/student/live-classes" className="p-2 bg-red-600/20 rounded-full hover:bg-red-600 transition-colors" title="Live Classes">
              <Video className="w-5 h-5 text-red-400 hover:text-white" />
            </Link>
            <LanguageSwitcher />
            <button onClick={() => { logout(); router.push('/'); }} className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium">Logout</button>
          </div>
        </div>

        {/* Points & Badges Banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-indigo-400">{user.points || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{t('totalPoints')}</div>
            </div>
            <div className="w-px h-12 bg-gray-600" />
            <div className="text-center">
              <div className="text-3xl font-extrabold text-yellow-400">{user.codingScore || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{t('codingScore')}</div>
            </div>
            <div className="w-px h-12 bg-gray-600" />
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-400">{enrolledCourses.length}</div>
              <div className="text-xs text-gray-400 mt-1">{t('enrolled')}</div>
            </div>
          </div>
          {(user.badges || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(user.badges || []).map(badge => (
                <div key={badge} className={`bg-gradient-to-r ${BADGE_INFO[badge]?.color || 'from-gray-600 to-gray-700'} text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5`}>
                  <span>{BADGE_INFO[badge]?.icon}</span>
                  <span>{BADGE_INFO[badge]?.label || badge}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <Link href="/leaderboard" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Leaderboard
            </Link>
            <Link href="/forum" className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Forum
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-gray-800 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('learning')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'learning' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
            📚 My Learning ({enrolledCourses.length})
          </button>
          <button onClick={() => setActiveTab('wishlist')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'wishlist' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>
            ❤️ Wishlist ({wishlist?.length || 0})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:col-span-3 space-y-8">

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div>
                {!wishlist || wishlist.length === 0 ? (
                  <div className="bg-gray-800 p-12 rounded-2xl border border-gray-700 text-center">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-400 mb-6">Browse courses and click the ❤️ to save them here.</p>
                    <Link href="/courses" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] inline-block">Browse Courses</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlist.map((item) => {
                      const course = typeof item === 'object' ? item : null;
                      if (!course?._id) return null;
                      return (
                        <div key={course._id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all group">
                          <div className="h-32 overflow-hidden relative">
                            {course.thumbnail && <img src={course.thumbnail} alt={course.title || 'Course'} className="w-full h-full object-cover" />}
                          </div>
                          <div className="p-4">
                            <div className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">{course.category}</div>
                            <h3 className="font-bold mb-3">{course.title}</h3>
                            <div className="flex gap-2">
                              <Link href={`/courses/${course._id}`} className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">View Course</Link>
                              <button onClick={() => toggleWishlist(course._id)} className="p-2 bg-gray-700 hover:bg-red-500/20 rounded-lg transition-colors" title="Remove from wishlist">
                                <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MY LEARNING TAB */}
            {activeTab === 'learning' && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-6"><BookOpen className="text-indigo-400" /> My Learning</h2>
                  {enrolledCourses.length === 0 ? (
                    <div className="bg-gray-800 p-12 rounded-2xl border border-gray-700 text-center">
                      <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">You haven't enrolled in any courses yet</h3>
                      <p className="text-gray-400 mb-6">Explore our catalog and find the perfect course for you.</p>
                      <Link href="/courses" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] inline-block">Browse Courses</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolledCourses.map((progressItem) => {
                        const course = progressItem.courseId;
                        if (!course) return null;
                        const totalItems = (course.videos?.length || 0) + (course.problems?.length || 0) + (course.quizzes?.length || 0);
                        const completedItems = (progressItem.completedVideos?.length || 0) + (progressItem.solvedProblems?.length || 0) + (progressItem.completedQuizzes?.length || 0);
                        const percent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
                        return (
                          <Link href={`/courses/${course._id}/learn`} key={course._id} className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] group block">
                            <div className="h-32 overflow-hidden relative">
                              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-4">
                              <div className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">{course.category}</div>
                              <h3 className="font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{course.title}</h3>
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-4">
                                <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2 flex justify-between">
                                <span>{completedItems} / {totalItems} completed</span>
                                <span>{percent}% Complete</span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><CheckCircle className="text-green-400" /> Completed Courses &amp; Certificates</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCourses.filter(p => p.certificateEarned).length === 0 ? (
                      <div className="md:col-span-2 bg-gray-800/50 p-8 rounded-2xl border border-gray-700 border-dashed text-center">
                        <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Finish your first course to earn a certificate.</p>
                      </div>
                    ) : (
                      enrolledCourses.filter(p => p.certificateEarned).map(p => (
                        <div key={p.courseId._id} className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                          <Award className="w-12 h-12 text-green-400 mb-3" />
                          <h4 className="font-bold text-lg">{p.courseId.title}</h4>
                          <Link href={`/student/certificates/${p.courseId._id}`} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">View Certificate</Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-gray-400">Courses Enrolled</span>
                  <span className="font-bold text-xl">{enrolledCourses.length}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400">Certificates Earned</span>
                  <span className="font-bold text-xl">{enrolledCourses.filter(p => p.certificateEarned).length}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400">Coding Score</span>
                  <span className="font-bold text-xl text-indigo-400">{user.codingScore || 0} pts</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-400">Avg Quiz Score</span>
                  <span className="font-bold text-xl text-green-400">
                    {quizChartData.length > 0 && quizChartData.some(d => d.score > 0)
                      ? Math.round(quizChartData.reduce((acc, curr) => acc + curr.score, 0) / quizChartData.length) + '%' 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Coding Challenges</h3>
              <p className="text-sm text-gray-400 mb-4">Practice your skills and earn points!</p>
              <Link href="/student/challenges" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                Start Practicing
              </Link>
            </div>

            {/* AI Tools Card */}
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 p-6 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_70%)]" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">AI Learning Tools</h3>
                <p className="text-xs text-gray-400 mb-4">Code Review · Interview Prep · Study Planner</p>
                <Link href="/student/ai-tools" className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  Open AI Tools
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Charts Section */}
        {enrolledCourses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Course Performance Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quiz Scores Chart */}
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-4">Average Quiz Scores by Course</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} 
                        itemStyle={{ color: '#fff' }} 
                        formatter={(value) => [`${value}%`, 'Score']}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTitle || label}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Completion Distribution Chart */}
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-4">Overall Completion Breakdown</h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionData}
                        dataKey="completed"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} 
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [value, 'Completed']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {completionData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-gray-400">{entry.name} ({entry.completed})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explore More Courses Section */}
        {unenrolledCourses.length > 0 && (
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-6">Explore More Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {unenrolledCourses.map((course) => (
                <Link href={`/courses/${course._id}`} key={course._id}>
                  <div className="h-full bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] group cursor-pointer flex flex-col">
                    <div className="h-48 overflow-hidden relative bg-gray-700">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                        <div className="bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-white">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          4.8
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(course._id);
                          }}
                          className="bg-gray-900/80 backdrop-blur p-2 rounded-full hover:bg-gray-800 transition-colors"
                        >
                          <Heart 
                            className={`w-5 h-5 ${wishlist?.some(w => w._id === course._id || w === course._id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                          />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-indigo-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg text-white">
                        ${course.price === 0 ? "Free" : course.price}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs text-indigo-400 font-semibold mb-2 uppercase tracking-wider">{course.category}</div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{course.title}</h3>
                      <p className="text-gray-400 mb-4 flex-1 text-sm line-clamp-3">{course.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
