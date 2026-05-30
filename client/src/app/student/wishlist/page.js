"use client";
import Link from "next/link";
import { BookOpen, Star, Brain, Loader2, Heart, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import useAuthStore from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Wishlist() {
  const { user, toggleWishlist } = useAuthStore();
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFullWishlist = async () => {
      if (!user) return;
      try {
        const response = await axios.get("http://localhost:5000/api/users/wishlist", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setWishlistCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullWishlist();
  }, [user]);

  const handleRemove = async (courseId) => {
    // Optimistic UI update
    setWishlistCourses(prev => prev.filter(c => c._id !== courseId));
    // Call the store action to update backend
    await toggleWishlist(courseId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-xl">Please <Link href="/login" className="text-indigo-500 hover:underline">log in</Link> to view your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30 transition-colors">
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-indigo-500" />
              <span className="font-bold text-xl tracking-tight">AI-Learn</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/student/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex items-center gap-3">
          <Heart className="w-10 h-10 text-red-500 fill-red-500" />
          <h1 className="text-4xl font-extrabold">My Wishlist</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        ) : wishlistCourses.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
             <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
             <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
             <p className="text-muted-foreground mb-6">Explore courses and add them to your wishlist to keep track of what you want to learn.</p>
             <Link href="/courses" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all">
               Explore Courses
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistCourses.map((course) => (
              <Link href={`/courses/${course._id}`} key={course._id}>
                <div className="h-full bg-card border border-border rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.2)] group cursor-pointer flex flex-col">
                  <div className="h-48 overflow-hidden relative bg-muted">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <div className="bg-gray-900/80 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-white">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        4.8
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(course._id);
                        }}
                        className="bg-gray-900/80 backdrop-blur p-2 rounded-full hover:bg-red-500/20 transition-colors group/btn"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 group-hover/btn:text-red-500" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-indigo-600 px-3 py-1 rounded-full text-sm font-bold shadow-lg text-white">
                      ${course.price === 0 ? "Free" : course.price}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-indigo-400 font-semibold mb-2 uppercase tracking-wider">{course.category}</div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">{course.title}</h3>
                    <p className="text-muted-foreground mb-4 flex-1 text-sm line-clamp-3">{course.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-border">
                      <span className="flex items-center gap-1 text-foreground">By {course.instructor?.name || 'Instructor'}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.videos?.length || 0} lessons</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
