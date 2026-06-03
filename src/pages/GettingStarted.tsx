import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Users, BookOpen, Shield, Wifi, Award, ArrowRight, CheckCircle, Zap, Globe, Star } from 'lucide-react';
import gsap from 'gsap';

const steps = [
  {
    icon: Heart,
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-200',
    title: 'Bem-vindo à sua jornada',
    desc: 'O "Mais Saúde" é uma plataforma gamificada que combina ciência, tecnologia e comunidade para apoiar pessoas que desejam reduzir ou cessar o consumo de álcool e tabaco. Não estamos sozinhos — milhões de brasileiros lutam contra a dependência, e aqui você encontra o apoio que precisa.',
  },
  {
    icon: Compass,
    color: 'from-blue-400 to-cyan-500',
    shadow: 'shadow-blue-200',
    title: 'Como funciona',
    desc: 'A cada dia, você faz um check-in rápido (30 segundos) registrando como se sente, se consumiu algo e seu nível de fissura. Com base nisso, a plataforma calcula sua ofensiva (streak), seus pontos e seus ganhos de saúde — tudo em tempo real.',
  },
  {
    icon: BookOpen,
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-200',
    title: 'Aprenda em 2–5 minutos por dia',
    desc: 'Módulos diários com quizzes interativos, micro-aulas com timeline de saúde, desafios práticos e reflexões guiadas. Todo conteúdo é validado por especialistas: OMS, INCA, The Lancet, APA e NHS.',
  },
  {
    icon: Users,
    color: 'from-teal-400 to-emerald-500',
    shadow: 'shadow-teal-200',
    title: 'Encontre sua Tribo',
    desc: 'Tribos são comunidades de até 50 pessoas com objetivos em comum. Compartilhe conquistas, envie kudos e presentes virtuais, e participe de chats com modo anônimo. Ninguém precisa estar sozinho nessa jornada.',
  },
  {
    icon: Award,
    color: 'from-pink-400 to-rose-500',
    shadow: 'shadow-pink-200',
    title: 'Gamificação ética',
    desc: 'Ganhe pontos a cada dia de sobriedade, suba de nível, desbloqueie badges e troque pontos por prêmios na loja. Mas atenção: a gamificação é projetada para reforçar sua autonomia, nunca para criar dependência do app.',
  },
  {
    icon: Wifi,
    color: 'from-cyan-400 to-blue-500',
    shadow: 'shadow-cyan-200',
    title: 'Lembretes inteligentes via IoT',
    desc: 'Conecte seus dispositivos (smartphone, smart speaker, TV, computador) e receba lembretes personalizados nos horários que você definir. O sistema usa MQTT para baixa latência e funciona mesmo com conexão instável.',
  },
  {
    icon: Shield,
    color: 'from-red-400 to-rose-500',
    shadow: 'shadow-red-200',
    title: 'Segurança e privacidade',
    desc: 'Seus dados são criptografados, protegidos pela LGPD e nunca compartilhados com terceiros. Mensagens anônimas não podem ser vinculadas ao seu perfil. E em momentos de crise: CVV 188 (24h gratuito), SAMU 192 e CAPS local.',
  },
  {
    icon: Star,
    color: 'from-amber-400 to-yellow-500',
    shadow: 'shadow-amber-200',
    title: 'Níveis de experiência',
    desc: 'Conforme seus dias limpo aumentam, a interface evolui: Iniciante (1–30 dias) foca em sobrevivência; Intermediário (31–180 dias) mostra análises de saúde; Mentor (180+ dias) desbloqueia ferramentas de liderança e apadrinhamento.',
  },
];

const references = [
  'OMS — Global Status Report on Alcohol and Health 2022',
  'Nutt et al. — Drug harms in the UK. The Lancet, 2010',
  'INCA — Observatório do Controle do Tabaco (Brasil)',
  'APA — DSM-5: Alcohol Use Disorder',
  'Doll et al. — Smoking cessation benefits. BMJ, 2004',
];

export default function GettingStarted() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.step-card');
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Compass size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Primeiros Passos</h1>
              <p className="text-emerald-100 text-sm">Seu guia completo para a plataforma</p>
            </div>
          </div>
          <p className="text-emerald-100 leading-relaxed max-w-xl">
            Este guia vai te mostrar tudo que o <strong className="text-white">Mais Saúde</strong> oferece.
            Em poucos minutos você vai entender como usar cada funcionalidade para transformar
            "mais um dia" em hábito.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div ref={cardsRef} className="space-y-5 mb-10">
        {steps.map((step, i) => (
          <div key={i} className="step-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg ${step.shadow}`}>
                <step.icon className="text-white" size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-300 uppercase">Passo {String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick start checklist */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
          <Zap className="text-amber-500" size={18} /> Checklist de início rápido
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Completar o onboarding (avatar + Tribo)', done: true },
            { label: 'Fazer o primeiro check-in diário', done: false },
            { label: 'Completar o primeiro módulo educativo', done: false },
            { label: 'Entrar em um grupo de apoio', done: false },
            { label: 'Configurar um lembrete no celular', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                {item.done && <CheckCircle className="text-white" size={12} />}
              </div>
              <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-amber-800 font-medium'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific references */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="text-emerald-400" size={18} /> Referências científicas
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Todo conteúdo da plataforma é baseado em fontes revisadas por pares:
        </p>
        <div className="space-y-2">
          {references.map((ref, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-emerald-400 mt-0.5">•</span> {ref}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all text-lg shadow-lg shadow-emerald-200"
        >
          Começar minha jornada <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
