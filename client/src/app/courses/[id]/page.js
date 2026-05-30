"use client";
import { useEffect, useState, use } from "react";
import useCourseStore from "@/store/useCourseStore";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { PlayCircle, CheckCircle, Clock, BookOpen, Loader2, Code, HelpCircle, FileText, Brain, Heart, Star, CreditCard, Lock, X } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CourseDetail({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const { courses, fetchCourses } = useCourseStore();
  const { user, wishlist, toggleWishlist, fetchWishlist } = useAuthStore();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
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
    fetchCourses();
    if (user) {
      fetchWishlist();
    }
  }, [id, fetchCourses, user, fetchWishlist]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setEnrolling(true);
    try {
      if (course.price > 0) {
        setShowCheckout(true);
        setEnrolling(false);
        return;
      }

      // Free course — enroll directly
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/courses/${id}/enroll`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const updatedUser = { ...user, progress: profileRes.data.progress };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      useAuthStore.setState({ user: updatedUser });

      router.push("/student/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error enrolling in course.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleSimulatedPayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/payments/simulate-payment`, { courseId: course._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (res.data.enrolled) {
        const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/profile`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const updatedUser = { ...user, progress: profileRes.data.progress, notifications: profileRes.data.notifications };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        useAuthStore.setState({ user: updatedUser });
        router.push(`/courses/${course._id}/success`);
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
      setShowCheckout(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (!course) return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Course not found</div>;

  const isEnrolled = user?.progress?.find(p => p.courseId === course._id);
  const isInstructor = user?._id === course.instructor?._id;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">AI-Learn</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <>
                  <Link href="/student/wishlist" className="text-muted-foreground hover:text-foreground transition-colors">My Wishlist</Link>
                  <Link href="/student/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                </>
              ) : (
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground mb-6 text-sm flex items-center gap-1">&larr; Back to Courses</button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <img src={course.thumbnail} alt={course.title} className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-2xl border border-gray-700" />
            
            <div>
              <div className="text-indigo-400 font-semibold mb-2 uppercase tracking-wider text-sm">{course.category}</div>
              <h1 className="text-2xl sm:text-4xl font-extrabold mb-4">{course.title}</h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{course.description}</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><PlayCircle className="text-indigo-400" /> Lectures</h3>
                {!course.videos || course.videos.length === 0 ? (
                  <p className="text-gray-400">No videos uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {course.videos.map((v, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{v.title}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{v.duration || 0} min</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {course.problems && course.problems.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Code className="text-indigo-400" /> Coding Problems</h3>
                  <div className="space-y-3">
                    {course.problems.map((p, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <span className="font-medium">{p.title}</span>
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded uppercase tracking-wider">{p.language}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.quizzes && course.quizzes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="text-indigo-400" /> Quizzes</h3>
                  <div className="space-y-3">
                    {course.quizzes.map((q, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <span className="font-medium">{q.title || "Legacy Quiz"}</span>
                        <span className="text-gray-500 text-sm">{(q.questions || [{}]).length} questions {q.timeLimit > 0 && `• ${q.timeLimit} mins`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.assignments && course.assignments.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookOpen className="text-indigo-400" /> Assignments</h3>
                  <div className="space-y-3">
                    {course.assignments.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <span className="font-medium">{a.title}</span>
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Max Score: {a.maxScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.resources && course.resources.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText className="text-indigo-400" /> Resources</h3>
                  <div className="space-y-3">
                    {course.resources.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-700">
                        <span className="font-medium">{r.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enrollment Card — sticky on desktop, normal flow on mobile */}
          <div className="space-y-6 lg:order-last">
            <div className="bg-card p-5 sm:p-6 rounded-2xl border border-border lg:sticky lg:top-24">
              <div className="text-3xl font-bold mb-6">${course.price === 0 ? "Free" : course.price}</div>
              
              <div className="flex gap-2 mb-4">
                {isEnrolled ? (
                  <button onClick={() => router.push(`/courses/${course._id}/learn`)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(22,163,74,0.4)] flex justify-center items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Continue Learning
                  </button>
                ) : isInstructor ? (
                  <button onClick={() => router.push(`/instructor/courses/${course._id}`)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition-all">
                    Manage Course
                  </button>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex justify-center items-center gap-2 disabled:opacity-50">
                    {enrolling && <Loader2 className="w-5 h-5 animate-spin" />}
                    Enroll Now
                  </button>
                )}
                {user && (
                  <button 
                    onClick={() => toggleWishlist(course._id)}
                    className="p-3 border border-border rounded-xl hover:bg-muted transition-colors flex items-center justify-center"
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-6 h-6 ${wishlist?.some(w => w._id === course._id || w === course._id) ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-4 text-sm text-gray-400">
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-500" /> Lifetime Access</div>
                <div className="flex items-center gap-3"><PlayCircle className="w-5 h-5 text-gray-500" /> {course.videos?.length || 0} Lectures</div>
                <div className="flex items-center gap-3"><Code className="w-5 h-5 text-gray-500" /> {course.problems?.length || 0} Coding Problems</div>
                <div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-gray-500" /> {course.quizzes?.length || 0} Quizzes</div>
                <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-gray-500" /> {course.assignments?.length || 0} Assignments</div>
                <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-500" /> {course.resources?.length || 0} Resources</div>
                <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-gray-500" /> Certificate of Completion</div>
              </div>
            </div>
          </div>
        </div>

        {/* More Courses Section */}
        {courses && courses.filter(c => c._id !== id).length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8">More Courses You Might Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.filter(c => c._id !== id).slice(0, 3).map(c => (
                <Link href={`/courses/${c._id}`} key={c._id}>
                  <div className="h-full bg-card border border-border rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] group cursor-pointer flex flex-col">
                    <div className="h-48 overflow-hidden relative bg-muted">
                      <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-white">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        4.8
                      </div>
                      <div className="absolute bottom-4 left-4 bg-indigo-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg text-white">
                        ${c.price === 0 ? "Free" : c.price}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs text-indigo-400 font-semibold mb-2 uppercase tracking-wider">{c.category}</div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{c.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Simulated Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-white">
                <Lock className="w-4 h-4 text-green-400" /> Secure Checkout
              </div>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="text-sm text-gray-400 mb-1">Course</div>
                <div className="font-bold text-white truncate">{course.title}</div>
                <div className="text-xl font-black text-indigo-400 mt-2">${course.price}</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      autoComplete="off"
                      name="dummy-card"
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 font-mono"
                      maxLength={19}
                    />
                    <CreditCard className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-xs text-indigo-400 mt-1">Hint: Enter any random numbers to test</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="12/99"
                      autoComplete="off"
                      name="dummy-expiry"
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">CVC</label>
                    <input 
                      type="text" 
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="000"
                      autoComplete="off"
                      name="dummy-cvc"
                      className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleSimulatedPayment}
                disabled={processingPayment || !cardNumber || !expiry || !cvc}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>Pay ${course.price}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
