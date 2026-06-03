import { useState, useEffect } from 'react';
import { Award, TrendingUp, Flame, Target, CreditCard as Edit3, Save, X, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserBadge, DailyCheckin } from '../types';

const BADGE_ICONS: Record<string, string> = {
  footprints: '👣', flame: '🔥', star: '⭐', zap: '⚡', trophy: '🏆',
  'book-open': '📖', 'graduation-cap': '🎓', coins: '🪙', gem: '💎', users: '👥',
};

const goalLabel: Record<string, string> = { reduce: 'Reduzir', quit: 'Parar completamente' };
const substanceLabel: Record<string, string> = { alcohol: 'Álcool', tobacco: 'Tabaco', both: 'Álcool e Tabaco' };

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];
function getLevel(points: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}
function getProgressToNextLevel(points: number) {
  const level = getLevel(points);
  const current = LEVEL_THRESHOLDS[level - 1] || 0;
  const next = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return { pct: Math.min(((points - current) / (next - current)) * 100, 100), next };
}

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    substance_target: 'both',
    goal_type: 'reduce',
    motivation: '',
    quit_date: '',
  });

  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name,
      substance_target: profile.substance_target,
      goal_type: profile.goal_type,
      motivation: profile.motivation || '',
      quit_date: profile.quit_date || '',
    });
  }, [profile]);

  async function load() {
    const [badgesRes, checkinsRes] = await Promise.all([
      supabase.from('user_badges').select('*, badge:badges(*)').eq('user_id', user!.id).order('earned_at', { ascending: false }),
      supabase.from('daily_checkins').select('*').eq('user_id', user!.id).order('checkin_date', { ascending: false }).limit(30),
    ]);
    setBadges(badgesRes.data || []);
    setCheckins(checkinsRes.data || []);
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({ ...form, updated_at: new Date().toISOString() }).eq('id', user.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  }

  const level = getLevel(profile?.total_points || 0);
  const { pct, next } = getProgressToNextLevel(profile?.total_points || 0);

  // Build 30-day heatmap
  const today = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
  const checkinMap = new Map(checkins.map(c => [c.checkin_date, c]));

  const moodScore = checkins.length > 0
    ? (checkins.slice(0, 7).reduce((s, c) => s + c.mood, 0) / Math.min(checkins.length, 7)).toFixed(1)
    : '—';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu perfil</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: profile card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                {editing ? <X size={18} /> : <Edit3 size={18} />}
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="Seu nome"
                />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Foco</label>
                  <select value={form.substance_target} onChange={e => setForm(p => ({ ...p, substance_target: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="both">Álcool e Tabaco</option>
                    <option value="alcohol">Álcool</option>
                    <option value="tobacco">Tabaco</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Objetivo</label>
                  <select value={form.goal_type} onChange={e => setForm(p => ({ ...p, goal_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                    <option value="reduce">Reduzir consumo</option>
                    <option value="quit">Parar completamente</option>
                  </select>
                </div>
                <textarea
                  value={form.motivation}
                  onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  rows={2}
                  placeholder="Por que você quer mudar?"
                />
                <button onClick={saveProfile} disabled={saving} className="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2">
                  <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            ) : (
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{profile?.full_name}</h2>
                <p className="text-gray-500 text-sm mt-0.5">{substanceLabel[profile?.substance_target || 'both']} · {goalLabel[profile?.goal_type || 'reduce']}</p>
                {profile?.motivation && (
                  <p className="text-gray-600 text-sm mt-3 italic">"{profile.motivation}"</p>
                )}
              </div>
            )}
          </div>

          {/* Level card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Nível atual</p>
                <p className="text-3xl font-bold text-gray-900">{level}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Award className="text-amber-500" size={22} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{profile?.total_points || 0} pts</span>
                <span>Próx: {next} pts</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame size={16} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{profile?.streak_days ?? 0}</p>
              <p className="text-xs text-gray-500">Streak atual</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <TrendingUp size={16} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{profile?.longest_streak ?? 0}</p>
              <p className="text-xs text-gray-500">Recorde</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{checkins.length}</p>
              <p className="text-xs text-gray-500">Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{moodScore}</p>
              <p className="text-xs text-gray-500">Humor médio</p>
            </div>
          </div>
        </div>

        {/* Right: badges + heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Award className="text-amber-500" size={18} /> Conquistas ({badges.length})
            </h2>
            {badges.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Lock size={24} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Complete check-ins e módulos para ganhar badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map(ub => (
                  <div key={ub.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors">
                    <span className="text-2xl">{BADGE_ICONS[ub.badge?.icon || ''] || '🏅'}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-xs truncate">{ub.badge?.name}</p>
                      <p className="text-gray-400 text-xs">{new Date(ub.earned_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity heatmap */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Target className="text-emerald-500" size={18} /> Atividade — 30 dias
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {last30.map(date => {
                const ci = checkinMap.get(date);
                const hasConsumption = ci && (ci.consumed_alcohol || ci.consumed_tobacco);
                const hasCheckin = !!ci;
                return (
                  <div
                    key={date}
                    title={`${date}${ci ? ` · Humor ${ci.mood}/5` : ''}`}
                    className={`w-7 h-7 rounded-md transition-all cursor-default ${
                      !hasCheckin ? 'bg-gray-100' :
                      hasConsumption ? 'bg-red-300' :
                      'bg-emerald-500'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Sem consumo</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-300" /> Com consumo</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-100" /> Sem registro</div>
            </div>
          </div>

          {/* Recent checkins */}
          {checkins.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Últimos check-ins</h2>
              <div className="space-y-2">
                {checkins.slice(0, 7).map(ci => (
                  <div key={ci.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{new Date(ci.checkin_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={ci.consumed_alcohol ? 'text-red-500' : 'text-emerald-600'}>
                        {ci.consumed_alcohol ? 'Bebeu' : 'Sem álcool'}
                      </span>
                      <span className={ci.consumed_tobacco ? 'text-red-500' : 'text-emerald-600'}>
                        {ci.consumed_tobacco ? 'Fumou' : 'Sem tabaco'}
                      </span>
                      <span className="text-gray-400">😊 {ci.mood}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
