import { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface InteractionProps {
  targetUserId: string;
  onSuccess?: () => void;
}

export default function InteractionButton({ targetUserId, onSuccess }: InteractionProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (!user || user.id === targetUserId) return;

    setLoading(true);
    try {
      if (liked) {
        await supabase
          .from('user_interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('target_user_id', targetUserId)
          .eq('interaction_type', 'like');
      } else {
        await supabase.from('user_interactions').insert({
          user_id: user.id,
          target_user_id: targetUserId,
          interaction_type: 'like',
        });

        await supabase.from('user_points').insert({
          user_id: targetUserId,
          points: 5,
          reason: `Ganhou uma curtida de ${user.email}`,
        });

        const profile = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', targetUserId)
          .maybeSingle();

        if (profile.data) {
          await supabase
            .from('profiles')
            .update({ total_points: (profile.data.total_points || 0) + 5 })
            .eq('id', targetUserId);
        }
      }
      setLiked(!liked);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao interagir:', error);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading || !user}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
        liked
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
      } disabled:opacity-50`}
    >
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
      <span className="text-xs font-semibold">Curtir</span>
    </button>
  );
}
