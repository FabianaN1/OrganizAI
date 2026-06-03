import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, ArrowLeft, CheckCircle, Shield, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Tribe } from '../types';

const AVATARS = [
  { key: 'warrior', label: 'Guerreiro', emoji: '⚔️' },
  { key: 'healer', label: 'Curandeiro', emoji: '🌿' },
  { key: 'explorer', label: 'Explorador', emoji: '🧭' },
  { key: 'sage', label: 'Sábio', emoji: '📖' },
  { key: 'guardian', label: 'Guardião', emoji: '🛡️' },
  { key: 'phoenix', label: 'Fênix', emoji: '🔥' },
  { key: 'mountain', label: 'Montanha', emoji: '⛰️' },
  { key: 'star', label: 'Estrela', emoji: '⭐' },
];

const focusLabel: Record<string, string> = { alcohol: 'Álcool', tobacco: 'Tabaco', both: 'Ambos' };

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('');
  const [goalType, setGoalType] = useState<'reduce' | 'quit'>('reduce');
  const [substanceTarget, setSubstanceTarget] = useState<'alcohol' | 'tobacco' | 'both'>('both');
  const [motivation, setMotivation] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isUsingCustomAvatar, setIsUsingCustomAvatar] = useState(false);

  const steps = [
    { title: 'Escolha seu avatar', desc: 'Sua identidade na jornada' },
    { title: 'Defina seu objetivo', desc: 'O que você quer conquistar?' },
    { title: 'Encontre sua Tribo', desc: 'Comunidades de até 50 pessoas' },
    { title: 'Consentimento LGPD', desc: 'Privacidade em primeiro lugar' },
  ];

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (profile?.avatar_key && profile.avatar_key !== 'default') { navigate('/dashboard'); return; }
    loadTribes();
  }, [user, profile]);

  async function loadTribes() {
    const { data } = await supabase.from('tribes').select('*').eq('is_active', true);
    setTribes(data || []);
    setLoading(false);
  }

  async function completeOnboarding() {
    if (!user || !lgpdConsent) return;
    setSaving(true);

    try {
      const updateData: Record<string, any> = {
        avatar_key: selectedAvatar || 'default',
        substance_target: substanceTarget,
        goal_type: goalType,
        motivation,
        experience_tier: 'beginner',
        updated_at: new Date().toISOString(),
      };

      if (customAvatarUrl) {
        updateData.avatar_url = customAvatarUrl;
      }

      if (displayName) {
        updateData.full_name = displayName;
      }

      if (selectedTribe) {
        updateData.tribe_id = selectedTribe;
      } else {
        updateData.tribe_id = null;
      }

      await supabase.from('profiles').update(updateData).eq('id', user.id);

      if (selectedTribe) {
        const { data: existing } = await supabase
          .from('tribe_memberships')
          .select('id')
          .eq('tribe_id', selectedTribe)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('tribe_memberships').insert({
            tribe_id: selectedTribe,
            user_id: user.id,
            role: 'member',
          });
        }
      }

      await refreshProfile();
      setSaving(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{steps[step].title}</h1>
              <p className="text-gray-500 text-sm">{steps[step].desc}</p>
            </div>

            {/* Step 0: Avatar */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Escolha um avatar pré-definido</p>
                  <div className="grid grid-cols-4 gap-4">
                    {AVATARS.map(av => (
                      <button
                        key={av.key}
                        onClick={() => { setSelectedAvatar(av.key); setIsUsingCustomAvatar(false); setCustomAvatarUrl(''); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          selectedAvatar === av.key && !isUsingCustomAvatar ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className="text-3xl">{av.emoji}</span>
                        <span className="text-xs text-gray-600 font-medium">{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Crie seu próprio avatar</p>
                  <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-emerald-300 cursor-pointer transition-colors">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 ${customAvatarUrl ? 'border-emerald-300' : 'border-gray-200'}`}>
                      {customAvatarUrl ? <img src={customAvatarUrl} alt="Avatar" className="w-full h-full rounded-xl object-cover" /> : '📤'}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-700">Fazer upload de imagem</p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG até 2MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size <= 2 * 1024 * 1024) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            setCustomAvatarUrl(base64);
                            setIsUsingCustomAvatar(true);
                            setSelectedAvatar('');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">Como os outros o chamarão?</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Seu nome de usuário (opcional)"
                    maxLength={20}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <p className="text-xs text-gray-400">{displayName.length}/20 caracteres</p>
                </div>
              </div>
            )}

            {/* Step 1: Goal */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">O que você quer parar ou reduzir?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([['both', 'Ambos'], ['alcohol', 'Álcool'], ['tobacco', 'Tabaco']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setSubstanceTarget(val)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          substanceTarget === val ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Seu objetivo</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setGoalType('reduce')}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        goalType === 'reduce' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Reduzir consumo
                    </button>
                    <button
                      onClick={() => setGoalType('quit')}
                      className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        goalType === 'quit' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Parar completamente
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Por que você quer mudar? (opcional)</label>
                  <textarea
                    value={motivation}
                    onChange={e => setMotivation(e.target.value)}
                    rows={3}
                    placeholder="Sua motivação pessoal..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Tribe */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
                    <Users size={16} />
                    <span>Tribos são comunidades de até 50 pessoas com objetivos em comum</span>
                  </div>
                </div>
                {tribes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTribe(t.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTribe === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: t.color + '20', color: t.color }}>
                        {t.icon === 'sunrise' ? '🌅' : t.icon === 'compass' ? '🧭' : t.icon === 'wind' ? '💨' : t.icon === 'building' ? '🏙️' : '🤝'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{t.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{t.description}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{focusLabel[t.substance_focus]}</span>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setSelectedTribe('')}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                    !selectedTribe ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  Escolher depois
                </button>
              </div>
            )}

            {/* Step 3: LGPD */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
                    <Shield size={16} className="text-emerald-500" />
                    Termos de Privacidade
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                    <p><strong>1. Dados coletados:</strong> Nome, e-mail, dados de saúde autodeclarados (consumo, humor, fissura). Nenhum dado biométrico ou de prontuário médico.</p>
                    <p><strong>2. Finalidade:</strong> Funcionamento da plataforma, gamificação, relatórios pessoais e comunicação com a Tribo.</p>
                    <p><strong>3. Compartilhamento:</strong> Seus dados não são compartilhados com terceiros. Mensagens anônimas não podem ser vinculadas ao seu perfil.</p>
                    <p><strong>4. Direitos LGPD:</strong> Você pode acessar, corrigir ou excluir seus dados a qualquer momento pelo Perfil.</p>
                    <p><strong>5. Seguranca:</strong> Dados criptografados em transito (TLS) e em repouso. RLS garante acesso apenas pelo proprietario.</p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={e => setLgpdConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-emerald-500"
                  />
                  <span className="text-sm text-gray-700">
                    Li e concordo com a Política de Privacidade e o tratamento dos meus dados conforme a LGPD (Lei 13.709/2018).
                  </span>
                </label>

                {lgpdConsent && (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-3">
                    <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
                    <span className="text-sm text-emerald-700 font-medium">Consentimento registrado!</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 0 && !selectedAvatar && !isUsingCustomAvatar}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-40"
                >
                  Próximo <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={completeOnboarding}
                  disabled={!lgpdConsent || saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-40"
                >
                  {saving ? 'Salvando...' : 'Comecar minha jornada'} <Heart size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
