import { useState, useEffect } from 'react';
import { Award, Flame, Star, PartyPopper, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Celebration } from '../types';

const AVATAR_MAP: Record<string, string> = {
  warrior: '⚔️', healer: '🌿', explorer: '🧭', sage: '📖',
  guardian: '🛡️', phoenix: '🔥', mountain: '⛰️', star: '⭐', default: '💚',
};

const typeConfig = {
  level_up: { label: 'Level Up', icon: Star, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  streak: { label: 'Streak', icon: Flame, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  badge: { label: 'Badge', icon: Award, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  milestone: { label: 'Marco', icon: PartyPopper, color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export default function Celebrations() {
  const { user } = useAuth();
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [user]);

  async function load() {
    const { data } = await supabase
      .from('celebrations')
      .select('*, profile:profiles(full_name, avatar_key)')
      .order('created_at', { ascending: false })
      .limit(50);
    setCelebrations(data || []);
    setLoading(false);
  }

  async function reactToCelebration(id: string) {
    await supabase.from('kudos').insert({
      sender_id: user!.id,
      receiver_id: '',
      message: 'Parabéns! 🎉',
      kudo_type: 'congrats',
    });
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mural de Celebração</h1>
        <p className="text-gray-500 mt-1">Toda conquista merece ser celebrada pela comunidade.</p>
      </div>

      {/* Intro card */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center gap-3 mb-3">
          <PartyPopper size={24} />
          <h2 className="font-bold text-lg">Cada dia é uma vitória</h2>
        </div>
        <p className="text-amber-100 text-sm leading-relaxed">
          Aqui publicamos automaticamente suas conquistas: level ups, streaks, badges e marcos.
          A comunidade pode reagir e enviar kudos para encorajar quem está na jornada.
        </p>
      </div>

      {celebrations.length === 0 ? (
        <div className="text-center py-16">
          <PartyPopper className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-500 mb-2">Nenhuma celebração ainda.</p>
          <p className="text-gray-400 text-sm">Complete check-ins e módulos para gerar celebrações!</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 mt-4 text-emerald-600 font-medium hover:underline text-sm">
            Ir para o painel <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {celebrations.map(c => {
            const cfg = typeConfig[c.celebration_type as keyof typeof typeConfig] || typeConfig.level_up;
            const CfgIcon = cfg.icon;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg bg-gray-50 flex-shrink-0">
                    {AVATAR_MAP[c.profile?.avatar_key || 'default']}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold border ${cfg.color}`}>
                        <CfgIcon size={12} /> {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{c.title}</h3>
                    {c.description && <p className="text-gray-500 text-xs mt-0.5">{c.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {c.profile?.full_name || 'Alguém da comunidade'}
                    </p>
                  </div>
                  <button
                    onClick={() => reactToCelebration(c.id)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-pink-50 hover:bg-pink-100 flex items-center justify-center transition-colors"
                    title="Enviar kudos"
                  >
                    <Heart className="text-pink-500" size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
