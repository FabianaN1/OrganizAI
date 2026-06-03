import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, Wifi, Library, User,
  LogOut, Menu, X, Heart, Bell, PartyPopper, ShoppingBag,
  MapPin, Accessibility, Compass, Flame, Sparkles,
  HandHeart, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../context/PresenceContext';

const navItems = [
  { path: '/dashboard', label: 'Minha Ofensiva', icon: Flame, color: 'text-orange-500', activeBg: 'bg-orange-500', hoverBg: 'hover:bg-orange-100' },
  { path: '/modules', label: 'Aprender', icon: BookOpen, color: 'text-emerald-600', activeBg: 'bg-emerald-500', hoverBg: 'hover:bg-emerald-100' },
  { path: '/community', label: 'Minha Tribo', icon: Users, color: 'text-teal-600', activeBg: 'bg-teal-500', hoverBg: 'hover:bg-teal-100' },
  { path: '/celebrations', label: 'Celebrar', icon: PartyPopper, color: 'text-amber-600', activeBg: 'bg-amber-500', hoverBg: 'hover:bg-amber-100' },
  { path: '/rewards', label: 'Meus Prêmios', icon: ShoppingBag, color: 'text-pink-600', activeBg: 'bg-pink-500', hoverBg: 'hover:bg-pink-100' },
  { path: '/meetups', label: 'Encontros', icon: MapPin, color: 'text-cyan-600', activeBg: 'bg-cyan-500', hoverBg: 'hover:bg-cyan-100' },
  { path: '/devices', label: 'Dispositivos', icon: Wifi, color: 'text-blue-600', activeBg: 'bg-blue-500', hoverBg: 'hover:bg-blue-100' },
  { path: '/library', label: 'Biblioteca', icon: Library, color: 'text-gray-600', activeBg: 'bg-gray-500', hoverBg: 'hover:bg-gray-100' },
  { path: '/getting-started', label: 'Primeiros Passos', icon: Compass, color: 'text-amber-700', activeBg: 'bg-amber-600', hoverBg: 'hover:bg-amber-100' },
  { path: '/accessibility', label: 'Acessibilidade', icon: Accessibility, color: 'text-rose-600', activeBg: 'bg-rose-500', hoverBg: 'hover:bg-rose-100' },
  { path: '/profile', label: 'Meu Perfil', icon: User, color: 'text-emerald-700', activeBg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-100' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut, user } = useAuth();
  const presenceCtx = usePresence();
  const onlineCount = presenceCtx?.onlineCount ?? 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.email === 'admin@maissaude.com';

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const levelColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const levelColor = levelColors[(profile?.level ?? 1) % levelColors.length];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-emerald-800 via-emerald-900 to-teal-900 fixed h-full z-10">
        {/* Logo */}
        <div className="p-6 border-b border-white/15">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-105 transition-all">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-lg leading-tight tracking-tight">
                Mais <span className="text-amber-300">Saúde</span>
              </p>
              <p className="text-[11px] text-emerald-300/70 font-medium leading-tight">
                Sem álcool, sem tabaco
              </p>
            </div>
          </Link>
        </div>

        {/* Profile mini-card */}
        {profile && (
          <div className="p-4 mx-4 mt-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                style={{ backgroundColor: levelColor }}
              >
                {profile.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{profile.full_name}</p>
                <p className="text-xs text-emerald-200/70">Nível {profile.level} · {profile.total_points} pts</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-emerald-200/70 mb-1">
                <span className="flex items-center gap-1">
                  <Flame className="text-amber-400" size={12} />
                  {profile.streak_days} dias seguidos
                </span>
                <span className="text-amber-400 font-semibold">{Math.min((profile.streak_days % 30) / 30 * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-gradient-to-r from-amber-400 to-orange-400"
                  style={{ width: `${Math.min((profile.streak_days % 30) / 30 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, color, activeBg, hoverBg }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                  active
                    ? `${activeBg} text-white shadow-md`
                    : `text-emerald-100 ${hoverBg} hover:text-emerald-900`
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : color}`} size={20} />
                <span>{label}</span>
                {active && <Sparkles className="w-3.5 h-3.5 ml-auto text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Emergency + sign out */}
        <div className="p-4 border-t border-white/15 space-y-1.5">
          {isAdmin && (
            <>
              <Link
                to="/admin/users"
                className="flex items-center gap-2 text-[13px] text-blue-300 hover:text-blue-200 transition-colors w-full px-4 py-2.5 rounded-xl hover:bg-blue-500/15 font-semibold"
              >
                <Users size={16} /> Usuários Online
              </Link>
              <Link
                to="/admin/registros"
                className="flex items-center gap-2 text-[13px] text-purple-300 hover:text-purple-200 transition-colors w-full px-4 py-2.5 rounded-xl hover:bg-purple-500/15 font-semibold"
              >
                <Shield size={16} /> Registros
              </Link>
            </>
          )}
          <button
            onClick={() => navigate('/getting-started')}
            className="flex items-center gap-2 text-[13px] text-amber-300 hover:text-amber-200 transition-colors w-full px-4 py-2.5 rounded-xl hover:bg-amber-500/15 font-semibold"
          >
            <HandHeart size={16} /> Como funciona?
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[13px] text-emerald-300/60 hover:text-red-400 transition-colors w-full px-4 py-2.5 rounded-xl hover:bg-red-500/15"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-20 bg-gradient-to-r from-emerald-800 to-teal-800 px-4 py-3 flex items-center justify-between shadow-md">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Mais <span className="text-amber-300">Saúde</span></span>
        </Link>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/20">
              <ShoppingBag size={14} className="text-amber-300" />
              <span className="text-xs font-semibold text-white">{profile.total_points} pts</span>
            </div>
          )}
          <div className="bg-green-500/20 backdrop-blur px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-green-500/30">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-300">{onlineCount}</span>
          </div>
          <button className="p-1.5 text-emerald-200 hover:text-white">
            <Bell size={18} />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-black/60" onClick={() => setMenuOpen(false)} />
      )}
      {menuOpen && (
        <div className="lg:hidden fixed top-14 right-0 w-72 bg-gradient-to-b from-emerald-800 to-teal-900 z-20 shadow-2xl rounded-l-2xl border border-white/15 p-4 max-h-[80vh] overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map(({ path, label, icon: Icon, color, activeBg }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all ${
                    active ? `${activeBg} text-white shadow-md` : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : color}`} size={20} />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={() => { handleSignOut(); setMenuOpen(false); }}
              className="flex items-center gap-2 text-[13px] text-emerald-200/60 hover:text-red-400 w-full px-4 py-3 rounded-xl hover:bg-red-500/15 mt-2 font-medium"
            >
              <LogOut size={16} /> Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-72 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
