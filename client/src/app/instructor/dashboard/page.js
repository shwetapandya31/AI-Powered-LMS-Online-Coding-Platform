"use client";
import useAuthStore from "@/store/useAuthStore";
import useCourseStore from "@/store/useCourseStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Video, Users, DollarSign, Loader2, Trash2, Code, Brain } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function InstructorDashboard() {
  const { user, logout } = useAuthStore();
  const { courses, fetchCourses, createCourse, isLoading } = useCourseStore();
  const router = useRouter();
  
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Web Development",
    price: 0,
    thumbnail: ""
  });

  useEffect(() => {
    setMounted(true);
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      router.push("/login");
    } else {
      fetchCourses();
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      setShowForm(false);
      setFormData({ title: "", description: "", category: "Web Development", price: 0, thumbnail: "" });
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return null;
  if (!user) return null;

  const myCourses = courses.filter(c => c.instructor?._id === user._id || c.instructor === user._id);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <LanguageSwitcher />
            <button onClick={() => { logout(); router.push('/'); }} className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-gray-800 p-4 sm:p-6 rounded-2xl border border-gray-700">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Video className="text-indigo-400" /> My Courses</h2>
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]"
              >
                <Plus className="w-4 h-4" /> Create Course
              </button>
            </div>

            {showForm && (
              <div className="bg-gray-800 p-6 rounded-2xl border border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)] animate-in fade-in slide-in-from-top-4">
                <h3 className="text-xl font-bold mb-4 text-indigo-400">New Course Details</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1 text-gray-300">Course Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                        required
                        placeholder="e.g. Master React 18"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm mb-1 text-gray-300">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors h-32"
                        required
                        placeholder="What will students learn?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-indigo-500 outline-none"
                      >
                        <option>Web Development</option>
                        <option>Data Science</option>
                        <option>Mobile App</option>
                        <option>UI/UX Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300">Thumbnail URL</label>
                      <input
                        type="url"
                        value={formData.thumbnail}
                        onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-indigo-500 outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-300">Price ($)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-indigo-500 outline-none"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Publish Course
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading && !showForm ? (
                 <div className="col-span-2 flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
              ) : myCourses.length === 0 ? (
                 <div className="col-span-2 bg-gray-800/50 p-12 rounded-2xl border border-gray-700 border-dashed text-center">
                    <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">You haven't created any courses yet.</p>
                 </div>
              ) : (
                myCourses.map((course) => (
                  <div key={course._id} onClick={() => router.push(`/instructor/courses/${course._id}`)} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-indigo-500/50 transition-colors group cursor-pointer">
                    <div className="h-40 bg-gray-700 relative overflow-hidden">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-3 left-3 bg-indigo-600 text-xs font-bold px-2 py-1 rounded-md shadow">
                        ${course.price === 0 ? "Free" : course.price}
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                         <button onClick={async (e) => { 
                           e.stopPropagation(); 
                           if(confirm("Delete this course?")) await useCourseStore.getState().deleteCourse(course._id);
                         }} className="bg-red-600/80 hover:bg-red-600 text-white p-1.5 rounded-md shadow">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">{course.category}</div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                      <div className="flex justify-between items-center text-sm text-gray-400 mt-4 pt-4 border-t border-gray-700">
                         <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.studentsEnrolled?.length || 0}</span>
                         <span className="flex items-center gap-1"><Video className="w-4 h-4" /> {course.videos?.length || 0} videos</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-2">Quick Stats</h3>
              <p className="text-gray-400 text-sm mb-6">Overview of your teaching performance.</p>
              
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Video className="w-5 h-5" /></div>
                    <span className="font-medium">Total Courses</span>
                  </div>
                  <span className="text-xl font-bold">{myCourses.length}</span>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Users className="w-5 h-5" /></div>
                    <span className="font-medium">Total Students</span>
                  </div>
                  <span className="text-xl font-bold">
                    {myCourses.reduce((acc, c) => acc + (c.studentsEnrolled?.length || 0), 0)}
                  </span>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><DollarSign className="w-5 h-5" /></div>
                    <span className="font-medium">Revenue</span>
                  </div>
                  <span className="text-xl font-bold">
                    ${myCourses.reduce((acc, c) => acc + (c.price * (c.studentsEnrolled?.length || 0)), 0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/30 p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Challenges</h3>
              <p className="text-gray-400 text-sm mb-4">Manage standalone coding practice problems for all students.</p>
              <button onClick={() => router.push('/instructor/challenges')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium">
                Manage Challenges
              </button>
            </div>

            {/* AI Quiz Generator Card */}
            <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 p-6 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_70%)]" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Quiz Generator</h3>
                <p className="text-gray-400 text-sm mb-4">Generate professional quiz questions from any topic using AI.</p>
                <button onClick={() => router.push('/instructor/ai-quiz')} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 rounded-lg transition-all font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  Generate Quiz
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 border border-red-500/30 p-6 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.15),transparent_70%)]" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Live Classes</h3>
                <p className="text-gray-400 text-sm mb-4">Schedule and broadcast live interactive sessions to your students.</p>
                <button onClick={() => router.push('/instructor/live-classes')} className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2 rounded-lg transition-all font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  Manage Live Classes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
