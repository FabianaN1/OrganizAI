import { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, Send, UserPlus, UserMinus, Lock, Gift, Heart, Crown, Shield, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SupportGroup, GroupMessage, Tribe, VirtualGift, SentGift } from '../types';

const AVATAR_MAP: Record<string, string> = {
  warrior: '⚔️', healer: '🌿', explorer: '🧭', sage: '📖',
  guardian: '🛡️', phoenix: '🔥', mountain: '⛰️', star: '⭐', default: '💚',
};

const GIFT_ICONS: Record<string, string> = {
  coffee: '☕', medal: '🎖️', heart: '❤️', shield: '🛡️', sparkles: '✨', crown: '👑', gift: '🎁',
};

const focusLabel: Record<string, string> = { alcohol: 'Álcool', tobacco: 'Tabaco', both: 'Ambos' };
const roleLabel: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  mentor: { label: 'Mentor', icon: Crown, color: 'text-amber-600' },
  elder: { label: 'Ancião', icon: Shield, color: 'text-blue-600' },
  member: { label: 'Membro', icon: Users, color: 'text-gray-500' },
};

type Tab = 'tribes' | 'groups' | 'gifts';

export default function Community() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('tribes');
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [tribeMemberships, setTribeMemberships] = useState<string[]>([]);
  const [tribeRoles, setTribeRoles] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [groupMemberships, setGroupMemberships] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<SupportGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [virtualGifts, setVirtualGifts] = useState<VirtualGift[]>([]);
  const [sentGifts, setSentGifts] = useState<SentGift[]>([]);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [sendingGift, setSendingGift] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => { if (activeGroup) loadMessages(activeGroup.id); }, [activeGroup]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function load() {
    const [tribesRes, tribeMembRes, groupsRes, groupMembRes, giftsRes, sentRes] = await Promise.all([
      supabase.from('tribes').select('*').eq('is_active', true),
      supabase.from('tribe_memberships').select('*').eq('user_id', user!.id),
      supabase.from('support_groups').select('*').eq('is_private', false),
      supabase.from('group_memberships').select('group_id').eq('user_id', user!.id),
      supabase.from('virtual_gifts').select('*').eq('is_active', true),
      supabase.from('sent_gifts').select('*, gift:virtual_gifts(*), sender_profile:profiles!sent_gifts_sender_id_fkey(full_name, avatar_key)')
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order('created_at', { ascending: false }).limit(10),
    ]);
    setTribes(tribesRes.data || []);
    const tmData = tribeMembRes.data || [];
    setTribeMemberships(tmData.map(m => m.tribe_id));
    setTribeRoles(Object.fromEntries(tmData.map((m: { tribe_id: string; role: string }) => [m.tribe_id, m.role])));
    setGroups(groupsRes.data || []);
    setGroupMemberships((groupMembRes.data || []).map((m: { group_id: string }) => m.group_id));
    setVirtualGifts(giftsRes.data || []);
    setSentGifts(sentRes.data || []);
    setLoading(false);
  }

  async function loadMessages(groupId: string) {
    const { data } = await supabase.from('group_messages').select('*, profile:profiles(full_name)').eq('group_id', groupId).order('created_at', { ascending: true }).limit(50);
    setMessages(data || []);
  }

  async function joinGroup(groupId: string) {
    await supabase.from('group_memberships').insert({ group_id: groupId, user_id: user!.id });
    setGroupMemberships(prev => [...prev, groupId]);
  }
  async function leaveGroup(groupId: string) {
    await supabase.from('group_memberships').delete().eq('group_id', groupId).eq('user_id', user!.id);
    setGroupMemberships(prev => prev.filter(id => id !== groupId));
    if (activeGroup?.id === groupId) setActiveGroup(null);
  }

  async function joinTribe(tribeId: string) {
    await supabase.from('tribe_memberships').insert({ tribe_id: tribeId, user_id: user!.id, role: 'member' });
    await supabase.from('profiles').update({ tribe_id: tribeId }).eq('id', user!.id);
    setTribeMemberships(prev => [...prev, tribeId]);
    setTribeRoles(prev => ({ ...prev, [tribeId]: 'member' }));
  }
  async function leaveTribe(tribeId: string) {
    await supabase.from('tribe_memberships').delete().eq('tribe_id', tribeId).eq('user_id', user!.id);
    await supabase.from('profiles').update({ tribe_id: null }).eq('id', user!.id);
    setTribeMemberships(prev => prev.filter(id => id !== tribeId));
    setTribeRoles(prev => { const n = { ...prev }; delete n[tribeId]; return n; });
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeGroup || !user) return;
    setSending(true);
    await supabase.from('group_messages').insert({ group_id: activeGroup.id, user_id: user.id, content: newMsg.trim(), is_anonymous: anonymous });
    setNewMsg('');
    await loadMessages(activeGroup.id);
    setSending(false);
  }

  async function sendGift() {
    if (!selectedGift || !giftRecipient.trim() || !user || !profile) return;
    if (profile.total_points < selectedGift.cost_points) return;
    setSendingGift(true);
    await supabase.from('sent_gifts').insert({ sender_id: user.id, receiver_id: giftRecipient, gift_id: selectedGift.id, message: giftMessage });
    await supabase.from('user_points').insert({ user_id: user.id, points: -selectedGift.cost_points, reason: `Presente: ${selectedGift.name}` });
    await supabase.from('profiles').update({ total_points: profile.total_points - selectedGift.cost_points }).eq('id', user.id);
    setShowGiftModal(false);
    setSelectedGift(null);
    setGiftRecipient('');
    setGiftMessage('');
    await load();
    setSendingGift(false);
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  // Chat view
  if (activeGroup) {
    const isMember = groupMemberships.includes(activeGroup.id);
    return (
      <div className="flex flex-col h-screen lg:h-[calc(100vh-0px)]">
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
          <button onClick={() => setActiveGroup(null)} className="text-gray-500 hover:text-gray-700">← Voltar</button>
          <div><h2 className="font-semibold text-gray-900">{activeGroup.name}</h2><p className="text-xs text-gray-500">{activeGroup.description}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {!isMember && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <Lock className="mx-auto text-amber-500 mb-2" size={20} />
              <p className="text-amber-800 text-sm font-medium mb-3">Entre no grupo para ver e enviar mensagens</p>
              <button onClick={() => joinGroup(activeGroup.id)} className="bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">Entrar no grupo</button>
            </div>
          )}
          {isMember && messages.map(msg => {
            const isOwn = msg.user_id === user?.id;
            const senderName = msg.is_anonymous ? 'Anônimo' : (msg.profile?.full_name || 'Usuário');
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm'}`}>
                  {!isOwn && <p className={`text-xs font-semibold mb-1 ${msg.is_anonymous ? 'text-gray-400 italic' : 'text-emerald-600'}`}>{senderName}</p>}
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-200' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {isMember && (
          <div className="bg-white border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="w-3 h-3 accent-emerald-500" /> Enviar como anônimo
              </label>
              <button onClick={() => setShowGiftModal(true)} className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 ml-auto">
                <Gift size={12} /> Enviar presente
              </button>
            </div>
            <div className="flex gap-2">
              <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Escreva sua mensagem..." className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              <button onClick={sendMessage} disabled={sending || !newMsg.trim()} className="bg-emerald-500 text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-60"><Send size={18} /></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const tribeIcons: Record<string, string> = { sunrise: '🌅', compass: '🧭', wind: '💨', building: '🏙️', 'heart-handshake': '🤝' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Comunidade de Apoio</h1>
        <p className="text-gray-500 mt-1">Tribos, grupos e suporte para você não estar sozinho nessa jornada.</p>
      </div>

      {/* Safety banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8">
        <h3 className="font-semibold text-emerald-800 mb-2 text-sm">Regras de convivência</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {['Respeite todos sem julgamentos', 'Não compartilhe dados pessoais identificáveis', 'Use o modo anônimo se preferir', 'Em crise, ligue CVV 188 (24h)', 'Não incentive consumo de substâncias'].map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-emerald-700"><span className="text-emerald-400 mt-0.5">•</span> {r}</div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8">
        {([
          ['tribes', 'Tribos', Users, 'bg-teal-500'],
          ['groups', 'Grupos', MessageCircle, 'bg-emerald-500'],
          ['gifts', 'Presentes', Gift, 'bg-pink-500'],
        ] as const).map(([val, label, Icon, activeBg]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === val ? `${activeBg} text-white shadow-md` : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── TRIBES TAB ── */}
      {tab === 'tribes' && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm font-medium">Tribos são comunidades fechadas de até 50 pessoas para maximizar o senso de pertencimento.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {tribes.map(t => {
              const isMember = tribeMemberships.includes(t.id);
              const role = tribeRoles[t.id];
              const roleCfg = role ? roleLabel[role] : null;
              return (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: t.color + '20', color: t.color }}>
                      {tribeIcons[t.icon] || '👥'}
                    </div>
                    <div className="flex items-center gap-2">
                      {isMember && roleCfg && (
                        <span className={`flex items-center gap-1 text-xs font-semibold ${roleCfg.color}`}>
                          <roleCfg.icon size={12} /> {roleCfg.label}
                        </span>
                      )}
                      {isMember && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Membro</span>}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{t.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{focusLabel[t.substance_focus]}</span>
                    {isMember ? (
                      <div className="flex gap-2">
                        {role === 'mentor' && <span className="flex items-center gap-1 text-xs text-amber-600 font-medium"><Crown size={12} /> Ferramentas de mentoria</span>}
                        <button onClick={() => leaveTribe(t.id)} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                          <UserMinus size={13} /> Sair
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => joinTribe(t.id)} className="flex items-center gap-1 border-2 border-emerald-400 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-50 transition-colors">
                        <UserPlus size={13} /> Participar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GROUPS TAB ── */}
      {tab === 'groups' && (
        <div className="grid sm:grid-cols-2 gap-5">
          {groups.map(g => {
            const isMember = groupMemberships.includes(g.id);
            return (
              <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Users className="text-emerald-600" size={18} /></div>
                  {isMember && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Membro</span>}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{g.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{g.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{focusLabel[g.substance_focus]}</span>
                  <div className="flex gap-2">
                    {isMember ? (
                      <>
                        <button onClick={() => setActiveGroup(g)} className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors"><MessageCircle size={13} /> Chat</button>
                        <button onClick={() => leaveGroup(g.id)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors"><UserMinus size={13} /> Sair</button>
                      </>
                    ) : (
                      <button onClick={() => joinGroup(g.id)} className="flex items-center gap-1.5 border-2 border-emerald-400 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-50 transition-colors"><UserPlus size={13} /> Participar</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── GIFTS TAB ── */}
      {tab === 'gifts' && (
        <div>
          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-pink-800 text-sm font-medium"><Gift size={16} /> Envie mimos virtuais usando seus pontos de sobriedade!</div>
            <p className="text-pink-600 text-xs mt-1">Cada presente custa pontos que você ganhou ficando limpo. É uma forma de reconhecer a força dos outros.</p>
          </div>
          <h3 className="font-bold text-gray-900 mb-4">Catálogo de presentes</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
            {virtualGifts.map(g => (
              <button key={g.id} onClick={() => { setSelectedGift(g); setShowGiftModal(true); }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-pink-300 hover:bg-pink-50 transition-all">
                <span className="text-2xl">{GIFT_ICONS[g.icon] || '🎁'}</span>
                <span className="text-xs text-gray-700 font-medium">{g.name}</span>
                <span className="text-xs text-amber-600 font-bold">{g.cost_points} pts</span>
              </button>
            ))}
          </div>
          <h3 className="font-bold text-gray-900 mb-4">Presentes recebidos e enviados</h3>
          {sentGifts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum presente ainda. Envie o primeiro!</p>
          ) : (
            <div className="space-y-3">
              {sentGifts.map(sg => {
                const isSent = sg.sender_id === user?.id;
                return (
                  <div key={sg.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
                    <span className="text-2xl">{GIFT_ICONS[sg.gift?.icon || 'gift'] || '🎁'}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{isSent ? 'Você enviou' : 'Você recebeu'} <strong>{sg.gift?.name || 'Presente'}</strong></p>
                      {sg.message && <p className="text-xs text-gray-500 mt-0.5">"{sg.message}"</p>}
                      <p className="text-xs text-gray-400 mt-1">{isSent ? 'Para' : 'De'} {sg.sender_profile?.full_name || 'alguém'} · {new Date(sg.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Heart className={`flex-shrink-0 ${isSent ? 'text-pink-400' : 'text-pink-500'}`} size={16} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Gift modal */}
      {showGiftModal && selectedGift && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <span className="text-4xl">{GIFT_ICONS[selectedGift.icon] || '🎁'}</span>
              <h3 className="font-bold text-gray-900 mt-2">{selectedGift.name}</h3>
              <p className="text-amber-600 text-sm font-bold">{selectedGift.cost_points} pontos</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ID do destinatário</label>
                <input type="text" value={giftRecipient} onChange={e => setGiftRecipient(e.target.value)}
                  placeholder="Cole o ID do usuário..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mensagem (opcional)</label>
                <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value)} rows={2}
                  placeholder="Parabéns pela sua força!" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              {(profile?.total_points ?? 0) < selectedGift.cost_points && (
                <p className="text-red-500 text-xs font-medium">Pontos insuficientes. Você tem {profile?.total_points ?? 0} pts.</p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowGiftModal(false); setSelectedGift(null); }} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={sendGift} disabled={sendingGift || !giftRecipient.trim() || (profile?.total_points ?? 0) < selectedGift.cost_points}
                className="flex-1 bg-pink-500 text-white py-2.5 rounded-lg font-medium hover:bg-pink-600 disabled:opacity-60">
                {sendingGift ? 'Enviando...' : 'Enviar presente'}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-8">Em crise? <strong className="text-red-500">CVV 188</strong> (24h gratuito) · SAMU 192</p>
    </div>
  );
}
