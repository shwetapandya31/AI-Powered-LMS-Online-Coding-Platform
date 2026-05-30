import { useState, useEffect } from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, Award } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import axios from 'axios';

export default function NotificationsDropdown() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && user.notifications) {
      setNotifications(user.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking notifications as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'achievement': return <Award className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-bold flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-4 border-b border-zinc-100 dark:border-zinc-800 flex gap-3 transition ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="shrink-0 mt-0.5">{getIcon(n.type)}</div>
                  <div>
                    <p className={`text-sm ${!n.read ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>{n.message}</p>
                    <p className="text-xs text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
