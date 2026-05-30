'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';
import { ArrowLeft, Heart, MessageSquare, User, Clock, Send } from 'lucide-react';
import Link from 'next/link';

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/forum/${params.id}`);
        setPost(res.data);
      } catch (err) {
        console.error('Error fetching post', err);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchPost();
  }, [params.id]);

  const handleLike = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/forum/${params.id}/like`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setPost(res.data);
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/forum/${params.id}/comments`, { content: newComment }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setPost(res.data);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading post...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Post not found</h2>
      <Link href="/forum" className="text-indigo-500 hover:underline">Return to Forum</Link>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-8 text-gray-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/forum')}
          className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 mb-8 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Discussions
        </button>

        {/* Original Post */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-md border border-zinc-200 dark:border-zinc-800 mb-8">
          <h1 className="text-3xl font-extrabold mb-4">{post.title}</h1>
          <div className="flex items-center gap-6 text-sm text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold">
                {post.author?.name ? post.author.name[0].toUpperCase() : 'U'}
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-base">{post.author?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <Clock className="w-4 h-4" /> 
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-8 text-lg text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button 
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition font-bold"
            >
              <Heart className="w-5 h-5 text-rose-500" /> {post.likes?.length || 0} Likes
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-500">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> {post.comments?.length || 0} Comments
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Discussion <span className="text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-0.5 rounded-full text-lg">{post.comments?.length || 0}</span>
        </h3>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
          <form onSubmit={handleComment} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0"></div>
            <div className="flex-1">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 dark:text-white"
                required
              />
              <div className="flex justify-end mt-3">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition"
                >
                  {submitting ? 'Posting...' : <><Send className="w-4 h-4" /> Post Reply</>}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {post.comments?.map((comment, index) => (
            <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-zinc-400" />
                  <span className="font-semibold">{comment.user?.name || 'Anonymous'}</span>
                </div>
                <span className="text-sm text-zinc-400">{new Date(comment.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 ml-7">{comment.content}</p>
            </div>
          ))}
          {(!post.comments || post.comments.length === 0) && (
            <div className="text-center py-10 text-zinc-500">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
