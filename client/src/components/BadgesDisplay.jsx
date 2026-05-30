import { Award } from 'lucide-react';

export default function BadgesDisplay({ badges }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Award className="text-indigo-500 w-5 h-5" /> Your Achievements
      </h3>
      <div className="flex flex-wrap gap-3">
        {badges.map((badge, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 px-4 py-2 rounded-xl"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-indigo-900 dark:text-indigo-100 capitalize">
              {badge.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
