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
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setOnlineUsers([]);
      setIsLoading(false);
      return;
    }

    let subscribed = true;

    const setupPresence = async () => {
      try {
        const channel = supabase.channel('online-users', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            if (!subscribed) return;
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
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            if (!subscribed) return;
            const newUser = (newPresences as any[])?.[0]?.user;
            if (newUser && !onlineUsers.find((u) => u.id === newUser.id)) {
              setOnlineUsers((prev) => [...prev, newUser]);
            }
          })
          .on('presence', { event: 'leave' }, () => {
            if (!subscribed) return;
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
              try {
                await channel.track({
                  user: {
                    id: user.id,
                    email: user.email || '',
                    full_name: profile.full_name || 'Usuário',
                    avatar_key: profile.avatar_key || 'default',
                    avatar_url: profile.avatar_url || '',
                  },
                });
              } catch (err) {
                console.error('Erro ao rastrear presença:', err);
              }
            }
          });

        return () => {
          subscribed = false;
          channel.unsubscribe();
        };
      } catch (err) {
        console.error('Erro ao configurar presença:', err);
        setIsLoading(false);
      }
    };

    const cleanup = setupPresence();

    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [user?.id, profile?.id]);

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
