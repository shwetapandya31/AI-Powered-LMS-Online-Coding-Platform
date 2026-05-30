'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { MessageCircle, Heart, User, Clock, Plus } from 'lucide-react';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/forum`);
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching forum posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading forum...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 text-gray-900 dark:text-zinc-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              <MessageCircle className="text-indigo-500 w-10 h-10" /> Community Forum
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Discuss topics, ask questions, and share your knowledge.</p>
          </div>
          <Link href="/forum/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg">
            <Plus className="w-5 h-5" /> New Post
          </Link>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link href={`/forum/${post._id}`} key={post._id} className="block group">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-500 transition relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h2 className="text-2xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{post.title}</h2>
                <p className="text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4">{post.content}</p>
                
                <div className="flex items-center gap-6 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> 
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{post.author?.name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full font-bold">
                    <MessageCircle className="w-4 h-4" /> 
                    <span>{post.comments?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full font-bold">
                    <Heart className="w-4 h-4" /> 
                    <span>{post.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No posts yet. Be the first to start a discussion!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
