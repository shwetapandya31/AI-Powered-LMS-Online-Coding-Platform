"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "@/store/useAuthStore";
import { Video, Calendar, Clock, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InstructorLiveClasses() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    meetingLink: "",
  });

  useEffect(() => {
    if (!user || user.role !== "instructor") {
      router.push("/login");
      return;
    }
    fetchLiveClasses();
  }, [user, router]);

  const fetchLiveClasses = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/live-classes`);
      // Filter only classes created by this instructor
      const myClasses = res.data.filter(c => c.instructor?._id === user._id);
      setLiveClasses(myClasses);
    } catch (err) {
      console.error("Error fetching live classes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/live-classes`,
        formData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setShowForm(false);
      setFormData({ title: "", description: "", scheduledAt: "", meetingLink: "" });
      fetchLiveClasses();
    } catch (err) {
      console.error("Error creating live class", err);
      alert("Failed to create live class");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this live class?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/live-classes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchLiveClasses();
    } catch (err) {
      console.error("Error deleting live class", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/instructor/dashboard" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8 transition w-fit">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Video className="text-red-500 w-8 h-8" /> Manage Live Classes
            </h1>
            <p className="text-gray-400 mt-2">Schedule and host interactive sessions for your students.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> Schedule Class
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 mb-8 animate-in fade-in">
            <h3 className="text-xl font-bold mb-4">Schedule New Class</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Class Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none focus:border-red-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none focus:border-red-500 h-24"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Scheduled Time</label>
                <input 
                  type="datetime-local" 
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none focus:border-red-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Meeting Link (e.g. Jitsi, Zoom) - Optional</label>
                <input 
                  type="url" 
                  value={formData.meetingLink || ""}
                  onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                  placeholder="https://meet.jit.si/your-class-name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold">Schedule</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveClasses.length === 0 && !showForm && (
            <div className="col-span-2 text-center py-16 bg-gray-800/50 rounded-2xl border border-gray-700 border-dashed">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">You haven't scheduled any live classes yet.</p>
            </div>
          )}
          
          {liveClasses.map(cls => (
            <div key={cls._id} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-red-500/50 transition">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold line-clamp-1">{cls.title}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${cls.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-700 text-gray-300'}`}>
                  {cls.status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2">{cls.description}</p>
              
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {new Date(cls.scheduledAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  {new Date(cls.scheduledAt).toLocaleTimeString()}
                </div>
              </div>

              <div className="flex gap-3">
                <Link href={`/student/live-classes/${cls._id}`} className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-2 rounded-lg font-bold text-center transition flex items-center justify-center gap-2">
                  <Video className="w-4 h-4" /> Go to Room
                </Link>
                <button onClick={() => handleDelete(cls._id)} className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
