import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const passwordRequirements = [
  { id: 'length', label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { id: 'symbol', label: 'Um símbolo (!@#$%)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function Auth() {
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'login' ? 'login' : 'register';
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [showResetForm, setShowResetForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = passwordRequirements.map(req => ({ ...req, pass: req.test(password) }));
  const isPasswordValid = passwordStrength.every(r => r.pass);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate('/dashboard');
    } else {
      if (!fullName.trim()) { setError('Nome é obrigatório'); setLoading(false); return; }
      if (!isPasswordValid) { setError('Senha não atende aos requisitos'); setLoading(false); return; }
      const { error } = await signUp(email, password, fullName.trim());
      if (error) setError(error.message);
      else navigate('/onboarding');
    }
    setLoading(false);
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setResetMessage('');
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetMessage('Verifique seu e-mail para redefinir sua senha!');
        setResetEmail('');
        setTimeout(() => setShowResetForm(false), 3000);
      }
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação');
    }
    setLoading(false);
  }

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
        <div className="p-6">
          <button onClick={() => setShowResetForm(false)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-8">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar senha</h1>
              <p className="text-gray-500 text-sm mb-6">Digite o e-mail associado à sua conta. Enviaremos um link para redefinir sua senha.</p>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                {resetMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Heart className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? 'Bem-vindo de volta' : 'Comece sua jornada'}
            </h1>
            <p className="text-gray-500 text-sm mb-7">
              {isLogin ? 'Entre na sua conta.' : 'Crie sua conta gratuitamente.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowResetForm(true)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <div className="relative mb-3">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={isLogin ? 1 : 8}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                    {passwordStrength.map(req => (
                      <div key={req.id} className="flex items-center gap-2">
                        {req.pass ? (
                          <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${req.pass ? 'text-gray-700' : 'text-gray-400'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!isLogin && !isPasswordValid)}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              {isLogin ? 'Novo aqui?' : 'Já tem conta?'}{' '}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); setShowResetForm(false); }}
                className="text-emerald-600 font-medium hover:underline"
              >
                {isLogin ? 'Criar conta' : 'Entrar'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Em crise? Ligue <strong className="text-red-500">CVV 188</strong> · SAMU 192
          </p>
        </div>
      </div>
    </div>
  );
}
