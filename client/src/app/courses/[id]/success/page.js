'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, PlayCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import axios from 'axios';
import Link from 'next/link';

export default function CourseSuccessPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Refresh user profile to get updated progress after payment
    const refreshProfile = async () => {
      try {
        const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/profile`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const updatedUser = { ...user, progress: profileRes.data.progress, notifications: profileRes.data.notifications };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        useAuthStore.setState({ user: updatedUser });
      } catch (err) {
        console.error('Error refreshing profile after payment:', err);
      } finally {
        setLoading(false);
      }
    };

    // Give the webhook a tiny bit of time to process before fetching
    setTimeout(() => {
      refreshProfile();
    }, 2000);
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Confirming your enrollment...</h2>
        <p className="text-gray-400 mt-2">Please wait a moment while we process your payment.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-8 text-lg">You are now successfully enrolled in the course. Get ready to start learning!</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/courses/${id}/learn`} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25">
            <PlayCircle className="w-5 h-5" /> Start Learning
          </Link>
          <Link href="/student/dashboard" className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
