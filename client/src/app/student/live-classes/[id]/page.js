'use client';
import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import useAuthStore from '@/store/useAuthStore';
import { Video, MessageSquare, Send, Users, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function LiveClassRoom({ params }) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/live-classes/${id}`);
        setLiveClass(res.data);
      } catch (err) {
        console.error('Error fetching live class', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();

    // Socket.IO setup
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}`);
    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join-class', { classId: id, userName: user?.name || 'Student' });
    });
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('receive-message', (data) => {
      setMessages(prev => [...prev, data]);
    });
    newSocket.on('participant-count', (count) => {
      setParticipantCount(count);
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [id, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    const msgData = {
      classId: id,
      user: user?.name || 'Student',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    socket.emit('send-message', msgData);
    setMessages(prev => [...prev, msgData]);
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
        <Video className="w-16 h-16 text-gray-600" />
        <h2 className="text-2xl font-bold">Live class not found</h2>
        <Link href="/student/live-classes" className="text-indigo-400 hover:underline">Back to Live Classes</Link>
      </div>
    );
  }

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';
  const backHref = isInstructor ? '/instructor/live-classes' : '/student/live-classes';

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="font-bold text-lg">{liveClass.title}</h1>
            <p className="text-gray-400 text-sm">Instructor: {liveClass.instructor?.name || 'TBA'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{participantCount}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${connected ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
            {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {connected ? 'Connected' : 'Connecting...'}
          </div>
          {liveClass.status === 'live' && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full inline-block"></span>LIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black relative flex items-center justify-center" style={{ minHeight: '60vh' }}>
            {liveClass.meetingLink ? (
              <iframe
                src={liveClass.meetingLink}
                className="w-full h-full absolute inset-0"
                allow="camera; microphone; fullscreen; display-capture"
                title="Live Class"
              />
            ) : (
              <div className="text-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(99,102,241,0.5)]">
                    <Video className="w-16 h-16 text-white" />
                  </div>
                  {liveClass.status === 'live' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{liveClass.title}</h2>
                <p className="text-gray-400 mb-2">{liveClass.description}</p>
                <p className="text-gray-500 text-sm">
                  {liveClass.status === 'live'
                    ? 'The session is live! The stream will appear here when the instructor shares their screen.'
                    : `Scheduled for ${new Date(liveClass.scheduledAt).toLocaleString()}`}
                </p>
                {isInstructor && (
                  <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-4 max-w-md mx-auto text-sm text-left">
                    <p className="text-indigo-400 font-semibold mb-2">📹 To broadcast:</p>
                    <p className="text-gray-300">Add a meeting link (e.g., Google Meet, Zoom, Jitsi) when scheduling. Students will see your stream embedded here.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Class Info Strip */}
          <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>📅 {new Date(liveClass.scheduledAt).toLocaleDateString()}</span>
              <span>🕐 {new Date(liveClass.scheduledAt).toLocaleTimeString()}</span>
              <span className={`font-semibold ${liveClass.status === 'live' ? 'text-red-400' : 'text-yellow-400'}`}>
                {liveClass.status === 'live' ? '🔴 Session Active' : '⏳ Scheduled'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Chat Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2 font-semibold">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Live Chat
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 text-sm mt-10">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No messages yet. Say hello! 👋
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  {!msg.isMe && (
                    <span className="text-xs text-indigo-400 font-semibold mb-1">{msg.user}</span>
                  )}
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-600 mt-1">{msg.timestamp}</span>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2 rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
