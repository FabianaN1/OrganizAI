import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface OnlineUser {
  id: string;
  email: string;
  full_name: string;
  avatar_key: string;
  avatar_url?: string;
}

interface PresenceContextType {
  onlineUsers: OnlineUser[];
  onlineCount: number;
  isLoading: boolean;
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: [],
  onlineCount: 0,
  isLoading: true,
});

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOnlineUsers([]);
      setIsLoading(false);
      return;
    }

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        const seenIds = new Set<string>();

        Object.entries(state).forEach(([, presences]) => {
          (presences as any[]).forEach((presence) => {
            if (presence.user && !seenIds.has(presence.user.id)) {
              users.push(presence.user);
              seenIds.add(presence.user.id);
            }
          });
        });

        setOnlineUsers(users);
        setIsLoading(false);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const newUser = (newPresences as any[])?.[0]?.user;
        if (newUser && !onlineUsers.find((u) => u.id === newUser.id)) {
          setOnlineUsers((prev) => [...prev, newUser]);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        const state = channel.presenceState();
        const remainingIds = new Set<string>();

        Object.entries(state).forEach(([, presences]) => {
          (presences as any[]).forEach((presence) => {
            if (presence.user) {
              remainingIds.add(presence.user.id);
            }
          });
        });

        setOnlineUsers((prev) => prev.filter((u) => remainingIds.has(u.id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const userProfile = await supabase
            .from('profiles')
            .select('id, email, full_name, avatar_key, avatar_url')
            .eq('id', user.id)
            .maybeSingle();

          if (userProfile.data) {
            await channel.track({
              user: userProfile.data,
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, onlineUsers]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, onlineCount: onlineUsers.length, isLoading }}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence deve ser usado dentro de PresenceProvider');
  }
  return context;
}
