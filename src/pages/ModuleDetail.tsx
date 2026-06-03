import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Award, Clock, BookOpen, Brain, Zap, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Module } from '../types';

interface QuizQuestion { question: string; options: string[]; correct: number; explanation: string; }
interface Lesson { sections: Array<{ type: string; title?: string; body?: string; text?: string; refs?: string[]; items?: Array<{ time: string; benefit: string }>; name?: string; description?: string; }> }
interface Challenge { instructions: string; goal: string; reflection_prompt: string; }
interface Reflection { intro: string; common_triggers: string[]; strategies: Array<{ name: string; description: string }>; reflection_prompt: string; source: string; }

const typeIcon = { quiz: Brain, lesson: BookOpen, challenge: Zap, reflection: Target };
const typeLabel = { quiz: 'Quiz', lesson: 'Aula', challenge: 'Desafio', reflection: 'Reflexão' };

export default function ModuleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (id && user) load();
  }, [id, user]);

  async function load() {
    const [modRes, compRes] = await Promise.all([
      supabase.from('modules').select('*').eq('id', id).maybeSingle(),
      supabase.from('module_completions').select('*').eq('user_id', user!.id).eq('module_id', id!).maybeSingle(),
    ]);
    setModule(modRes.data);
    setCompleted(!!compRes.data);
    setLoading(false);
  }

  async function completeModule(score = 100) {
    if (!user || !module) return;
    setSubmitting(true);
    await supabase.from('module_completions').upsert({ user_id: user.id, module_id: module.id, score }, { onConflict: 'user_id,module_id' });
    await supabase.from('user_points').insert({ user_id: user.id, points: module.points_reward, reason: `Módulo: ${module.title}` });
    await supabase.from('profiles').update({ total_points: (profile?.total_points || 0) + module.points_reward }).eq('id', user.id);
    await refreshProfile();
    setDone(true);
    setSubmitting(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!module) return <div className="p-8 text-center text-gray-500">Módulo não encontrado.</div>;

  const TypeIcon = typeIcon[module.module_type] || BookOpen;

  if (done || (completed && !done)) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {done ? 'Módulo concluído!' : 'Já concluído'}
          </h2>
          {done && (
            <div className="flex items-center justify-center gap-2 text-amber-500 font-semibold mb-6">
              <Award size={18} />
              +{module.points_reward} pontos ganhos!
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link to="/modules" className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors">
              Ver todos os módulos
            </Link>
            <Link to="/dashboard" className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const content = module.content as Record<string, unknown>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm transition-colors">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
              <TypeIcon size={12} /> {typeLabel[module.module_type]}
            </div>
            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{module.duration_minutes} min</span>
            <span className="flex items-center gap-1 text-xs text-amber-500 font-medium"><Award size={11} />+{module.points_reward} pts</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{module.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{module.description}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {module.module_type === 'quiz' && content.questions && (
            <QuizContent
              questions={(content.questions as QuizQuestion[])}
              currentQuestion={currentQuestion}
              answers={answers}
              showResult={showResult}
              onAnswer={(i) => {
                const newAnswers = [...answers];
                newAnswers[currentQuestion] = i;
                setAnswers(newAnswers);
                if (currentQuestion < (content.questions as QuizQuestion[]).length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                } else {
                  setShowResult(true);
                  const score = Math.round(newAnswers.filter((a, idx) => a === (content.questions as QuizQuestion[])[idx].correct).length / (content.questions as QuizQuestion[]).length * 100);
                  completeModule(score);
                }
              }}
            />
          )}

          {module.module_type === 'lesson' && (
            <LessonContent lesson={content as unknown as Lesson} onComplete={() => completeModule(100)} submitting={submitting} />
          )}

          {module.module_type === 'challenge' && (
            <ChallengeContent challenge={content as unknown as Challenge} onComplete={() => completeModule(100)} submitting={submitting} />
          )}

          {module.module_type === 'reflection' && (
            <ReflectionContent reflection={content as unknown as Reflection} onComplete={() => completeModule(100)} submitting={submitting} />
          )}
        </div>
      </div>
    </div>
  );
}

function QuizContent({ questions, currentQuestion, answers, showResult, onAnswer }: {
  questions: QuizQuestion[]; currentQuestion: number; answers: number[]; showResult: boolean;
  onAnswer: (i: number) => void;
}) {
  if (showResult) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    return (
      <div className="text-center py-4">
        <div className="text-4xl font-bold text-emerald-500 mb-2">{Math.round(correct / questions.length * 100)}%</div>
        <p className="text-gray-700 font-medium">{correct} de {questions.length} corretas</p>
        <div className="mt-6 space-y-4">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct;
            return (
              <div key={i} className={`text-left p-4 rounded-xl border-2 transition-all ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold flex-shrink-0 ${isCorrect ? 'bg-emerald-200 text-emerald-700' : 'bg-red-200 text-red-700'}`}>
                    {isCorrect ? '✓ Correto' : '✗ Incorreto'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">P{i + 1}: {q.question}</p>
                <p className="text-xs text-gray-700 mb-2"><strong>Sua resposta:</strong> {q.options[answers[i]]}</p>
                {!isCorrect && <p className="text-xs text-gray-700 mb-2"><strong>Resposta correta:</strong> {q.options[q.correct]}</p>}
                <p className="text-xs text-gray-700 italic border-t border-gray-200 pt-2 mt-2"><strong>Explicação:</strong> {q.explanation}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Pergunta {currentQuestion + 1} de {questions.length}</span>
        <div className="h-1.5 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(currentQuestion / questions.length) * 100}%` }} />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{q.question}</h2>
      <div className="space-y-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i)}
            className="w-full text-left px-5 py-3.5 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-sm font-medium text-gray-700"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold mr-3 text-gray-600">
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function LessonContent({ lesson, onComplete, submitting }: { lesson: Lesson; onComplete: () => void; submitting: boolean }) {
  return (
    <div className="space-y-6">
      {lesson.sections?.map((s, i) => (
        <div key={i}>
          {s.type === 'text' && (
            <div>
              {s.title && <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>}
              <p className="text-gray-700 text-sm leading-relaxed">{s.body}</p>
            </div>
          )}
          {s.type === 'highlight' && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 px-5 py-4 rounded-r-xl">
              <p className="text-emerald-800 text-sm font-medium">{s.text}</p>
            </div>
          )}
          {s.type === 'timeline' && (
            <div className="space-y-3">
              {s.items?.map((item, j) => (
                <div key={j} className="flex items-start gap-3">
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-lg font-mono flex-shrink-0">{item.time}</span>
                  <p className="text-gray-700 text-sm">{item.benefit}</p>
                </div>
              ))}
            </div>
          )}
          {s.type === 'tip' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 text-sm mb-1">{s.title}</h4>
              <p className="text-blue-700 text-sm">{s.body}</p>
            </div>
          )}
          {s.type === 'source' && (
            <div className="text-xs text-gray-400 space-y-1">
              <p className="font-medium">Fontes:</p>
              {s.refs?.map((r, j) => <p key={j}>• {r}</p>)}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={onComplete}
        disabled={submitting}
        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Salvando...' : 'Concluir aula'}
      </button>
    </div>
  );
}

function ChallengeContent({ challenge, onComplete, submitting }: { challenge: Challenge; onComplete: () => void; submitting: boolean }) {
  const [reflection, setReflection] = useState('');
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2">Desafio</h3>
        <p className="text-amber-700 text-sm">{challenge.instructions}</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Meta</h3>
        <p className="text-gray-600 text-sm">{challenge.goal}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{challenge.reflection_prompt}</label>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
          rows={3}
          placeholder="Escreva sua reflexão..."
        />
      </div>
      <button
        onClick={onComplete}
        disabled={submitting || !reflection.trim()}
        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Salvando...' : 'Completar desafio'}
      </button>
    </div>
  );
}

function ReflectionContent({ reflection, onComplete, submitting }: { reflection: Reflection; onComplete: () => void; submitting: boolean }) {
  const [answer, setAnswer] = useState('');
  return (
    <div className="space-y-6">
      <p className="text-gray-700 text-sm leading-relaxed">{reflection.intro}</p>
      {reflection.common_triggers && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Gatilhos comuns</h3>
          <div className="flex flex-wrap gap-2">
            {reflection.common_triggers.map((t, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      )}
      {reflection.strategies && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Estratégias</h3>
          <div className="space-y-3">
            {reflection.strategies.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{s.name}</h4>
                <p className="text-gray-600 text-xs">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{reflection.reflection_prompt}</label>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={4}
          placeholder="Sua reflexão..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>
      <button
        onClick={onComplete}
        disabled={submitting || !answer.trim()}
        className="w-full bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Salvando...' : 'Concluir reflexão'}
      </button>
    </div>
  );
}
