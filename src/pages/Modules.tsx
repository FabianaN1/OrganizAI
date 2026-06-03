import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, Target, Brain, Clock, Award, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Module, ModuleCompletion } from '../types';

const typeConfig = {
  quiz: { label: 'Quiz', icon: Brain, bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-50 text-blue-700', ring: 'ring-blue-200' },
  lesson: { label: 'Aula', icon: BookOpen, bg: 'bg-emerald-500', text: 'text-white', light: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-200' },
  challenge: { label: 'Desafio', icon: Zap, bg: 'bg-amber-500', text: 'text-white', light: 'bg-amber-50 text-amber-700', ring: 'ring-amber-200' },
  reflection: { label: 'Reflexão', icon: Target, bg: 'bg-rose-500', text: 'text-white', light: 'bg-rose-50 text-rose-700', ring: 'ring-rose-200' },
};

const difficultyLabel: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
const substanceLabel: Record<string, string> = { alcohol: 'Álcool', tobacco: 'Tabaco', both: 'Geral', general: 'Geral' };
const substanceColor: Record<string, string> = { alcohol: 'bg-orange-100 text-orange-700', tobacco: 'bg-gray-100 text-gray-700', both: 'bg-teal-100 text-teal-700', general: 'bg-gray-100 text-gray-700' };

export default function Modules() {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [completions, setCompletions] = useState<ModuleCompletion[]>([]);
  const [filter, setFilter] = useState<'all' | 'quiz' | 'lesson' | 'challenge' | 'reflection'>('all');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => {
    if (gridRef.current && !loading) {
      const cards = gridRef.current.querySelectorAll('.module-card');
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' });
    }
  }, [filter, loading]);

  async function load() {
    const [modsRes, compsRes] = await Promise.all([
      supabase.from('modules').select('*').eq('is_active', true).order('order_index'),
      supabase.from('module_completions').select('*').eq('user_id', user!.id),
    ]);
    setModules(modsRes.data || []);
    setCompletions(compsRes.data || []);
    setLoading(false);
  }

  const filtered = filter === 'all' ? modules : modules.filter(m => m.module_type === filter);
  const completedIds = new Set(completions.map(c => c.module_id));
  const completedCount = modules.filter(m => completedIds.has(m.id)).length;

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Módulos de Aprendizado</h1>
        <p className="text-gray-500 mt-1">{completedCount} de {modules.length} concluídos</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Progresso geral</span>
          <span className="text-sm text-emerald-600 font-semibold">{Math.round(completedCount / Math.max(modules.length, 1) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${completedCount / Math.max(modules.length, 1) * 100}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(['quiz', 'lesson', 'challenge', 'reflection'] as const).map(type => {
            const cfg = typeConfig[type];
            const count = modules.filter(m => m.module_type === type && completedIds.has(m.id)).length;
            const total = modules.filter(m => m.module_type === type).length;
            return (
              <div key={type} className={`text-center p-4 rounded-xl ${cfg.light}`}>
                <cfg.icon className="mx-auto mb-1.5" size={20} />
                <p className="text-xs font-bold">{cfg.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{count}/{total}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs — larger, colorful */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {([
          ['all', 'Todos', null],
          ['lesson', 'Aulas', 'lesson'],
          ['quiz', 'Quizzes', 'quiz'],
          ['challenge', 'Desafios', 'challenge'],
          ['reflection', 'Reflexões', 'reflection'],
        ] as const).map(([val, label, typeKey]) => {
          const cfg = typeKey ? typeConfig[typeKey] : null;
          const active = filter === val;
          return (
            <button
              key={val}
              onClick={() => setFilter(val as typeof filter)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                active
                  ? cfg
                    ? `${cfg.bg} ${cfg.text} shadow-md`
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
              }`}
            >
              {cfg && <cfg.icon size={16} />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Modules grid — larger cards */}
      <div ref={gridRef} className="grid sm:grid-cols-2 gap-6">
        {filtered.map(m => {
          const cfg = typeConfig[m.module_type];
          const done = completedIds.has(m.id);
          return (
            <Link
              key={m.id}
              to={`/modules/${m.id}`}
              className={`module-card group bg-white rounded-2xl border-2 shadow-sm p-6 hover:shadow-lg transition-all ${done ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-100 hover:border-emerald-300'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${cfg.light}`}>
                  <cfg.icon size={14} />
                  {cfg.label}
                </div>
                {done ? (
                  <CheckCircle className="text-emerald-500 flex-shrink-0" size={22} />
                ) : null}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-base leading-snug">{m.title}</h3>
              <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">{m.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${substanceColor[m.substance_tag]}`}>
                    {substanceLabel[m.substance_tag]}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{difficultyLabel[m.difficulty]}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-gray-400"><Clock size={12} /> {m.duration_minutes} min</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold"><Award size={12} /> +{m.points_reward} pts</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
