import { useState } from 'react';
import { ChevronRight, Users, X } from 'lucide-react';
import { usePresence } from '../context/PresenceContext';

const AVATAR_MAP: Record<string, string> = {
  warrior: '⚔️', healer: '🌿', explorer: '🧭', sage: '📖',
  guardian: '🛡️', phoenix: '🔥', mountain: '⛰️', star: '⭐', default: '💚',
};

export default function OnlineUsersSidebar() {
  const { onlineUsers, onlineCount, isLoading } = usePresence();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <span className="w-2.5 h-2.5 bg-highlight rounded-full animate-pulse" />
        <span className="font-semibold text-sm">{onlineCount} Online</span>
        <ChevronRight size={16} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <h3 className="font-bold text-gray-900">Online Agora</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-96">
            {onlineUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Ninguém online no momento
              </div>
            ) : (
              onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-lg shadow-sm">
                      {AVATAR_MAP[user.avatar_key] || AVATAR_MAP.default}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {user.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 text-center font-medium">
            {onlineCount} {onlineCount === 1 ? 'pessoa' : 'pessoas'} conectada{onlineCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </>
  );
}
