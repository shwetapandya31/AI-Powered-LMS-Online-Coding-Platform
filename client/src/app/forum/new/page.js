'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to post.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/forum`, 
        { title, content }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      router.push('/forum');
    } catch (err) {
      console.error('Error creating post', err);
      setError(err.response?.data?.message || 'Failed to create post.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 text-gray-900 dark:text-zinc-100">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.push('/forum')}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 mb-8 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Discussions
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-md border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-3xl font-extrabold mb-6">Create New Post</h1>
          
          {error && <div className="bg-rose-100 text-rose-600 p-4 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold mb-2">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-semibold mb-2">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask a question, or provide some insights..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px] resize-y dark:text-white"
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={submitting || !user}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg"
              >
                {submitting ? 'Publishing...' : <><Send className="w-5 h-5" /> Publish Post</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
