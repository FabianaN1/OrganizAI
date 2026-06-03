import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, TrendingUp, Award, BookOpen, CheckCircle,
  Smile, Frown, Meh, SmilePlus, AlertCircle, ArrowRight,
  Shield, Users, Heart, Zap, Coins, Target, MessageCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DailyCheckin, Module, UserBadge, Kudo, Celebration, ExperienceTier } from '../types';

const moodOptions = [
  { v: 1, icon: Frown, label: 'Péssimo', color: 'text-red-500' },
  { v: 2, icon: Frown, label: 'Ruim', color: 'text-orange-500' },
  { v: 3, icon: Meh, label: 'Ok', color: 'text-yellow-500' },
  { v: 4, icon: Smile, label: 'Bem', color: 'text-emerald-500' },
  { v: 5, icon: SmilePlus, label: 'Ótimo', color: 'text-green-600' },
];

const tierConfig: Record<ExperienceTier, { label: string; color: string; desc: string; icon: typeof Flame }> = {
  beginner: { label: 'Iniciante', color: 'emerald', desc: 'Foco em sobrevivência e urgência', icon: Flame },
  intermediate: { label: 'Intermediário', color: 'blue', desc: 'Foco em manutenção e análise', icon: TrendingUp },
  advanced: { label: 'Mentor', color: 'amber', desc: 'Foco em legado e liderança', icon: Award },
};

function getTier(streakDays: number): ExperienceTier {
  if (streakDays >= 180) return 'advanced';
  if (streakDays >= 31) return 'intermediate';
  return 'beginner';
}

const AVATAR_MAP: Record<string, string> = {
  warrior: '⚔️', healer: '🌿', explorer: '🧭', sage: '📖',
  guardian: '🛡️', phoenix: '🔥', mountain: '⛰️', star: '⭐', default: '💚',
};

export default function Dashboard() {
  const { profile, refreshProfile, user } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [recentModules, setRecentModules] = useState<Module[]>([]);
  const [recentBadges, setRecentBadges] = useState<UserBadge[]>([]);
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [checkinForm, setCheckinForm] = useState({
    mood: 3, consumed_alcohol: false, consumed_tobacco: false, cravings_level: 0, notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const tier = getTier(profile?.streak_days ?? 0);
  const tierCfg = tierConfig[tier];

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const [checkinRes, modulesRes, badgesRes, kudosRes, celebRes] = await Promise.all([
      supabase.from('daily_checkins').select('*').eq('user_id', user!.id).eq('checkin_date', today).maybeSingle(),
      supabase.from('modules').select('*').eq('is_active', true).order('order_index').limit(3),
      supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user!.id).order('earned_at', { ascending: false }).limit(3),
      supabase.from('kudos').select('*, sender_profile:profiles!kudos_sender_id_fkey(full_name, avatar_key)').eq('receiver_id', user!.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('celebrations').select('*, profile:profiles(full_name, avatar_key)').order('created_at', { ascending: false }).limit(5),
    ]);
    setTodayCheckin(checkinRes.data);
    setRecentModules(modulesRes.data || []);
    setRecentBadges(badgesRes.data || []);
    setKudos(kudosRes.data || []);
    setCelebrations(celebRes.data || []);
    setLoading(false);
  }

  async function submitCheckin() {
    if (!user) return;
    setSaving(true);
    const payload = { user_id: user.id, checkin_date: today, ...checkinForm };
    const { data } = await supabase.from('daily_checkins').upsert(payload, { onConflict: 'user_id,checkin_date' }).select().maybeSingle();
    if (data) {
      setTodayCheckin(data);
      const noConsumption = !checkinForm.consumed_alcohol && !checkinForm.consumed_tobacco;
      const newStreak = noConsumption ? (profile?.streak_days || 0) + 1 : 0;
      const longestStreak = Math.max(newStreak, profile?.longest_streak || 0);
      const newTier = getTier(newStreak);
      await supabase.from('profiles').update({
        streak_days: newStreak,
        longest_streak: longestStreak,
        last_checkin_date: today,
        experience_tier: newTier,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      await supabase.from('user_points').insert({ user_id: user.id, points: 20, reason: 'Check-in diário' });
      await supabase.from('profiles').update({ total_points: (profile?.total_points || 0) + 20 }).eq('id', user.id);
      if (noConsumption) {
        await supabase.from('celebrations').insert({
          user_id: user.id, tribe_id: profile?.tribe_id, celebration_type: 'streak',
          title: `${newStreak} dias limpo!`, description: `${profile?.full_name || 'Alguém'} completou ${newStreak} dias sem consumo.`
        });
      }
      await refreshProfile();
    }
    setSaving(false);
  }

  const healthGains = profile?.streak_days ? [
    profile.streak_days >= 1 && 'Pressão arterial normalizando',
    profile.streak_days >= 3 && 'Sono melhorando',
    profile.streak_days >= 7 && 'Capacidade pulmonar aumentando',
    profile.streak_days >= 14 && 'Risco cardíaco reduzindo',
    profile.streak_days >= 30 && 'Função hepática melhorada',
    profile.streak_days >= 90 && 'Pele e aparência visivelmente melhores',
    profile.streak_days >= 180 && 'Risco de doenças crônicas significativamente reduzido',
  ].filter(Boolean) : [];

  const moneySaved = profile?.streak_days ? Math.round(profile.streak_days * (profile.substance_target === 'tobacco' ? 12 : profile.substance_target === 'alcohol' ? 18 : 25)) : 0;

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with tier badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'} {AVATAR_MAP[profile?.avatar_key || 'default']}
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${
          tier === 'beginner' ? 'border-emerald-300 bg-emerald-50' :
          tier === 'intermediate' ? 'border-blue-300 bg-blue-50' :
          'border-amber-300 bg-amber-50'
        }`}>
          <tierCfg.icon size={18} className={
            tier === 'beginner' ? 'text-emerald-600' :
            tier === 'intermediate' ? 'text-blue-600' : 'text-amber-600'
          } />
          <div>
            <p className={`font-bold text-sm ${
              tier === 'beginner' ? 'text-emerald-700' :
              tier === 'intermediate' ? 'text-blue-700' : 'text-amber-700'
            }`}>{tierCfg.label}</p>
            <p className="text-xs text-gray-500">{tierCfg.desc}</p>
          </div>
        </div>
      </div>

      {/* ──────── BEGINNER TIER ──────── */}
      {tier === 'beginner' && (
        <>
          {/* Streak centerpiece */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white mb-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute text-4xl" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, transform: `rotate(${i * 30}deg)` }}>
                  🔥
                </div>
              ))}
            </div>
            <div className="relative">
              <p className="text-emerald-200 text-sm font-medium mb-2">Sua ofensiva</p>
              <p className="text-7xl font-bold mb-2">{profile?.streak_days ?? 0}</p>
              <p className="text-emerald-100 text-lg">dias seguidos limpo</p>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">Recorde: {profile?.longest_streak ?? 0}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full">Nível {profile?.level ?? 1}</span>
              </div>
            </div>
          </div>

          {/* Panic / Quick support */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link to="/community" className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="text-emerald-600" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Pedir ajuda</p>
                  <p className="text-xs text-gray-500">Conecte-se com sua Tribo</p>
                </div>
              </div>
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-red-800 text-sm">Em crise?</p>
                  <p className="text-xs text-red-600">CVV 188 · SAMU 192</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <Award className="mx-auto text-amber-500 mb-2" size={20} />
              <p className="text-2xl font-bold text-gray-900">{profile?.total_points ?? 0}</p>
              <p className="text-xs text-gray-500">pontos</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <Coins className="mx-auto text-green-500 mb-2" size={20} />
              <p className="text-2xl font-bold text-gray-900">R${moneySaved}</p>
              <p className="text-xs text-gray-500">economizados</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <Target className="mx-auto text-blue-500 mb-2" size={20} />
              <p className="text-2xl font-bold text-gray-900">{recentBadges.length}</p>
              <p className="text-xs text-gray-500">conquistas</p>
            </div>
          </div>
        </>
      )}

      {/* ──────── INTERMEDIATE TIER ──────── */}
      {tier === 'intermediate' && (
        <>
          {/* Streak + Health progress */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl p-6 text-white">
              <p className="text-blue-200 text-sm font-medium mb-1">Ofensiva</p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-bold">{profile?.streak_days ?? 0}</span>
                <span className="text-blue-200 pb-2">dias</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <p className="font-bold">{profile?.total_points ?? 0}</p>
                  <p className="text-blue-200 text-xs">pontos</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <p className="font-bold">R${moneySaved}</p>
                  <p className="text-blue-200 text-xs">economizado</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <p className="font-bold">Nv {profile?.level ?? 1}</p>
                  <p className="text-blue-200 text-xs">nível</p>
                </div>
              </div>
            </div>

            {/* Health recovered graph */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="text-red-500" size={16} /> Saúde recuperada
              </h3>
              <div className="space-y-3">
                {healthGains.map((gain, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
                    <span className="text-sm text-gray-700">{gain}</span>
                  </div>
                ))}
                {healthGains.length === 0 && <p className="text-sm text-gray-400">Faça seu check-in para ver os ganhos!</p>}
              </div>
            </div>
          </div>

          {/* Trigger prevention */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm">
              <Shield className="text-amber-600" size={16} /> Prevenção de gatilhos
            </h3>
            <p className="text-amber-700 text-xs mb-3">Identifique e antecipe situações de risco esta semana.</p>
            <Link to="/modules" className="inline-flex items-center gap-1 text-amber-800 text-sm font-medium hover:underline">
              Módulo: Gatilhos e estratégias <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}

      {/* ──────── ADVANCED / MENTOR TIER ──────── */}
      {tier === 'advanced' && (
        <>
          {/* Leadership dashboard */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                {AVATAR_MAP[profile?.avatar_key || 'default']}
              </div>
              <div>
                <p className="font-bold text-lg">Painel de Mentor</p>
                <p className="text-amber-200 text-sm">{profile?.streak_days ?? 0} dias limpo · Nível {profile?.level ?? 1}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="font-bold">R${moneySaved}</p>
                <p className="text-amber-200 text-xs">economizado</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="font-bold">{profile?.total_points ?? 0}</p>
                <p className="text-amber-200 text-xs">pontos</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="font-bold">Elite</p>
                <p className="text-amber-200 text-xs">status</p>
              </div>
            </div>
          </div>

          {/* Mentorship tools */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Link to="/community" className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <Users className="text-amber-600" size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Gerenciar salas</h3>
              <p className="text-xs text-gray-500">Modere chats e apoie novatos</p>
            </Link>
            <Link to="/community" className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <Heart className="text-emerald-600" size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Apadrinhar</h3>
              <p className="text-xs text-gray-500">Acompanhe um novato na jornada</p>
            </Link>
            <Link to="/celebrations" className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Zap className="text-blue-600" size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Impacto social</h3>
              <p className="text-xs text-gray-500">Veja quantas vidas você impactou</p>
            </Link>
          </div>
        </>
      )}

      {/* ── COMMON: Daily check-in ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Check-in de hoje</h2>
            {todayCheckin && <CheckCircle className="text-emerald-500" size={18} />}
          </div>

          {todayCheckin ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-4 py-3">
                <CheckCircle className="text-emerald-500" size={16} />
                <span className="text-emerald-700 font-medium text-sm">Check-in concluído!</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>Humor: <strong>{moodOptions.find(m => m.v === todayCheckin.mood)?.label}</strong></div>
                <div>Fissura: <strong>{todayCheckin.cravings_level}/10</strong></div>
                <div>Álcool: <strong className={todayCheckin.consumed_alcohol ? 'text-red-500' : 'text-emerald-600'}>{todayCheckin.consumed_alcohol ? 'Sim' : 'Não'}</strong></div>
                <div>Tabaco: <strong className={todayCheckin.consumed_tobacco ? 'text-red-500' : 'text-emerald-600'}>{todayCheckin.consumed_tobacco ? 'Sim' : 'Não'}</strong></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Como você está?</p>
                <div className="flex gap-2">
                  {moodOptions.map(({ v, icon: Icon, label, color }) => (
                    <button key={v} onClick={() => setCheckinForm(f => ({ ...f, mood: v }))} title={label}
                      className={`flex-1 flex flex-col items-center py-2 rounded-lg border transition-all ${checkinForm.mood === v ? 'border-emerald-400 bg-emerald-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <Icon className={color} size={18} />
                      <span className="text-xs text-gray-500 mt-1">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Nível de fissura (0-10)</p>
                <input type="range" min={0} max={10} value={checkinForm.cravings_level} onChange={e => setCheckinForm(f => ({ ...f, cravings_level: +e.target.value }))} className="w-full accent-emerald-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Nenhuma</span><span>{checkinForm.cravings_level}</span><span>Intensa</span></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={checkinForm.consumed_alcohol} onChange={e => setCheckinForm(f => ({ ...f, consumed_alcohol: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
                  Consumi álcool
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={checkinForm.consumed_tobacco} onChange={e => setCheckinForm(f => ({ ...f, consumed_tobacco: e.target.checked }))} className="w-4 h-4 accent-emerald-500" />
                  Fumei
                </label>
              </div>
              <textarea placeholder="Nota opcional" value={checkinForm.notes} onChange={e => setCheckinForm(f => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300" rows={2} />
              <button onClick={submitCheckin} disabled={saving} className="w-full bg-emerald-500 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60">
                {saving ? 'Salvando...' : 'Registrar check-in (+20 pts)'}
              </button>
            </div>
          )}
        </div>

        {/* Kudos feed */}
        <div className="space-y-4">
          {kudos.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle className="text-pink-500" size={16} /> Kudos recentes
              </h3>
              <div className="space-y-3">
                {kudos.map(k => (
                  <div key={k.id} className="flex items-start gap-3 bg-pink-50 rounded-xl p-3">
                    <span className="text-lg">{AVATAR_MAP[k.sender_profile?.avatar_key || 'default']}</span>
                    <div>
                      <p className="text-sm text-gray-900"><strong>{k.sender_profile?.full_name || 'Alguém'}</strong></p>
                      <p className="text-xs text-gray-600">{k.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-red-500" size={18} />
              <h3 className="font-semibold text-red-800 text-sm">Em crise? Busque apoio</h3>
            </div>
            <div className="space-y-1 text-sm text-red-700">
              <p><strong>CVV:</strong> 188 (24h, gratuito)</p>
              <p><strong>SAMU:</strong> 192</p>
              <p><strong>CAPS:</strong> busque sua unidade local</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent modules */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Módulos disponíveis</h2>
          <Link to="/modules" className="flex items-center gap-1 text-emerald-600 text-sm font-medium hover:underline">Ver todos <ArrowRight size={14} /></Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {recentModules.map(m => (
            <Link key={m.id} to={`/modules/${m.id}`} className="group border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-emerald-500" />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  m.module_type === 'quiz' ? 'bg-blue-100 text-blue-700' :
                  m.module_type === 'challenge' ? 'bg-amber-100 text-amber-700' :
                  m.module_type === 'reflection' ? 'bg-rose-100 text-rose-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {m.module_type === 'quiz' ? 'Quiz' : m.module_type === 'challenge' ? 'Desafio' : m.module_type === 'reflection' ? 'Reflexão' : 'Aula'}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{m.title}</h3>
              <p className="text-xs text-gray-500">{m.duration_minutes} min · +{m.points_reward} pts</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
