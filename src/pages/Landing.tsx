import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Zap, Users, Wifi, BookOpen, Shield,
  TrendingUp, Award, ArrowRight, CheckCircle
} from 'lucide-react';
import gsap from 'gsap';

const stats = [
  { value: '8M+', label: 'mortes/ano por tabaco', source: 'OMS 2022' },
  { value: '3M+', label: 'mortes/ano por álcool', source: 'OMS 2022' },
  { value: '72/100', label: 'índice de dano do álcool', source: 'The Lancet 2010' },
  { value: '443', label: 'óbitos/dia pelo tabaco no BR', source: 'INCA 2023' },
];

const features = [
  {
    icon: Zap, color: 'bg-amber-50 text-amber-600',
    title: 'Gamificação ética',
    desc: 'Streaks, badges e pontos que reforçam sua autonomia — sem criar dependência do app.',
  },
  {
    icon: BookOpen, color: 'bg-blue-50 text-blue-600',
    title: 'Conteúdo validado',
    desc: 'Módulos baseados em OMS, INCA, The Lancet e diretrizes clínicas revisadas por especialistas.',
  },
  {
    icon: Users, color: 'bg-teal-50 text-teal-600',
    title: 'Rede de apoio',
    desc: 'Tribos de até 50 pessoas com moderação, check-ins anônimos e agendamento de reuniões.',
  },
  {
    icon: Wifi, color: 'bg-cyan-50 text-cyan-600',
    title: 'Integração IoT',
    desc: 'Lembretes inteligentes no seu smartphone, smart speaker ou smart TV via MQTT/Wi-Fi.',
  },
  {
    icon: TrendingUp, color: 'bg-rose-50 text-rose-600',
    title: 'Métricas de saúde',
    desc: 'Painel com dias sem consumo, ganhos estimados e tendências semanais de humor.',
  },
  {
    icon: Shield, color: 'bg-gray-50 text-gray-600',
    title: 'Privacidade por design',
    desc: 'Conforme LGPD, dados criptografados, salas anônimas e botão de emergência com CAPS/CVV.',
  },
];

const steps = [
  { n: '01', title: 'Crie seu perfil', desc: 'Defina sua meta: reduzir ou parar. Álcool, tabaco ou ambos.' },
  { n: '02', title: 'Faça check-ins diários', desc: 'Registre humor e consumo em 30 segundos. Construa sua ofensiva.' },
  { n: '03', title: 'Complete módulos', desc: 'Quiz, aulas, desafios e reflexões de 2–5 minutos por dia.' },
  { n: '04', title: 'Conecte dispositivos', desc: 'Receba lembretes no celular, smart speaker ou TV.' },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.hero-sub', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.15, ease: 'power3.out' });
      gsap.fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll('.feature-card');
      gsap.fromTo(cards, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' } });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" size={18} />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Mais <span className="text-secondary">Saúde</span></span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2">Sem álcool, sem tabaco</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Entrar
            </Link>
            <Link to="/auth?mode=register" className="text-sm bg-gradient-to-r from-secondary to-accent text-white px-5 py-2 rounded-lg hover:from-primary hover:to-secondary transition-all font-medium shadow-sm">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="pt-28 pb-20 px-6 bg-gradient-to-b from-blue-50/40 via-white to-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="hero-title inline-flex items-center gap-1.5 bg-blue-100 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Award size={12} /> MVP — Projeto Acadêmico 2025
          </span>
          <h1 className="hero-title text-5xl sm:text-6xl font-extrabold text-dark leading-tight mb-6">
            Sem álcool, sem tabaco —<br />
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">mais saúde</span>
          </h1>
          <p className="hero-sub text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Um jogo-social com conteúdo científico e integração IoT que lembra, engaja e cria redes de apoio para quem quer reduzir ou cessar o consumo.
          </p>
          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=register" className="flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white px-8 py-3.5 rounded-xl hover:from-primary hover:to-secondary transition-all font-semibold text-lg shadow-lg">
              Iniciar minha jornada <ArrowRight size={20} />
            </Link>
            <Link to="/auth?mode=login" className="text-gray-600 hover:text-dark transition-colors font-medium">
              Já tenho conta →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-highlight text-sm mb-10 font-medium uppercase tracking-widest">
            Por que isso importa — dados científicos
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <div className="text-3xl font-bold text-highlight mb-1">{s.value}</div>
                <div className="text-white text-sm font-medium mb-1">{s.label}</div>
                <div className="text-blue-200 text-xs">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo que você precisa para mudar</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Uma plataforma completa que combina ciência, tecnologia e comunidade.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-secondary transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-dark mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-dark mb-4">Como funciona</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="text-6xl font-black text-primary mb-3 opacity-100">{s.n}</div>
                <h3 className="font-semibold text-dark mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science callout */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary via-secondary to-accent">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen className="w-10 h-10 text-highlight mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Fundamentado em ciência</h2>
          <p className="text-blue-100 leading-relaxed mb-8">
            Todo o conteúdo é baseado em diretrizes da OMS/OPAS, estudos revisados por pares (The Lancet, BMJ, INCA) e recomendações clínicas da APA. Nenhum conselho de saúde sem fonte.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['OMS/OPAS', 'The Lancet', 'INCA', 'APA', 'NHS', 'DSM-5'].map((src) => (
              <span key={src} className="bg-white/15 text-white text-sm px-3 py-1.5 rounded-full border border-white/30 font-medium">{src}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-dark mb-4">Pronto para começar?</h2>
          <p className="text-gray-600 mb-8">Gratuito, sem cartão de crédito. Comece hoje e ganhe seus primeiros pontos.</p>
          <div className="space-y-3 text-left max-w-xs mx-auto mb-8">
            {['Perfil personalizado com suas metas', 'Módulos diários de 2–5 minutos', 'Tribo de apoio + check-in anônimo', 'Lembretes nos seus dispositivos'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="text-secondary flex-shrink-0" size={16} /> {item}
              </div>
            ))}
          </div>
          <Link to="/auth?mode=register" className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white px-8 py-3.5 rounded-xl hover:from-primary hover:to-secondary transition-all font-semibold text-lg shadow-lg">
            Criar conta grátis <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Emergency footer */}
      <div className="bg-red-50 border-t border-red-100 py-4 px-6 text-center">
        <p className="text-red-700 text-sm font-medium">
          Em crise? Ligue <strong>CVV 188</strong> (24h) · CAPS local · <strong>SAMU 192</strong>
        </p>
      </div>

      <footer className="bg-dark text-gray-400 text-xs text-center py-6 px-6">
        <p>&copy; 2026 Mais Saúde — Sem álcool, sem tabaco. Projeto Semana Tech. Não substitui acompanhamento médico profissional.</p>
        <p className="mt-1">Fontes: OMS 2022, Nutt et al. The Lancet 2010, INCA 2023, APA DSM-5.</p>
      </footer>
    </div>
  );
}
