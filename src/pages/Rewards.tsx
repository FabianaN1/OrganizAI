import { useState, useEffect } from 'react';
import { ShoppingBag, Crown, Palette, Sparkles, Award, Tag, CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { RewardItem, RewardPurchase } from '../types';

const categoryConfig = {
  avatar: { label: 'Avatares', icon: Crown, color: 'bg-amber-50 text-amber-700' },
  cosmetic: { label: 'Cosméticos', icon: Palette, color: 'bg-pink-50 text-pink-700' },
  title: { label: 'Títulos', icon: Tag, color: 'bg-blue-50 text-blue-700' },
  badge: { label: 'Selos', icon: Award, color: 'bg-emerald-50 text-emerald-700' },
  effect: { label: 'Efeitos', icon: Sparkles, color: 'bg-purple-50 text-purple-700' },
};

const GIFT_ICONS: Record<string, string> = {
  coffee: '☕', medal: '🎖️', heart: '❤️', shield: '🛡️', sparkles: '✨', crown: '👑',
  gift: '🎁', 'shopping-bag': '🛍️', 'badge-check': '✅', 'shield-check': '🔰', frame: '🖼️',
};

export default function Rewards() {
  const { user, profile, refreshProfile } = useAuth();
  const [items, setItems] = useState<RewardItem[]>([]);
  const [purchases, setPurchases] = useState<RewardPurchase[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const [itemsRes, purchRes] = await Promise.all([
      supabase.from('reward_items').select('*').eq('is_available', true).order('cost_points'),
      supabase.from('reward_purchases').select('*').eq('user_id', user!.id).order('purchased_at', { ascending: false }),
    ]);
    setItems(itemsRes.data || []);
    setPurchases(purchRes.data || []);
    setLoading(false);
  }

  async function purchaseItem(item: RewardItem) {
    if (!user || !profile) return;
    if (profile.total_points < item.cost_points) return;
    setPurchasing(item.id);
    await supabase.from('reward_purchases').insert({ user_id: user.id, item_id: item.id, paid_points: item.cost_points });
    await supabase.from('user_points').insert({ user_id: user.id, points: -item.cost_points, reason: `Compra: ${item.name}` });
    await supabase.from('profiles').update({ total_points: profile.total_points - item.cost_points }).eq('id', user.id);
    await refreshProfile();
    await load();
    setPurchasing(null);
  }

  const purchasedIds = new Set(purchases.map(p => p.item_id));
  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Prêmios</h1>
          <p className="text-gray-500 mt-1">Troque seus pontos por itens exclusivos no app.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 flex items-center gap-3">
          <CreditCard className="text-amber-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Saldo disponível</p>
            <p className="text-xl font-bold text-gray-900">{profile?.total_points ?? 0} pts</p>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === 'all' ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'}`}>
          Todos
        </button>
        {(Object.entries(categoryConfig) as [string, typeof categoryConfig[keyof typeof categoryConfig]][]).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === key ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'}`}>
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => {
          const owned = purchasedIds.has(item.id);
          const canAfford = (profile?.total_points ?? 0) >= item.cost_points;
          const catCfg = categoryConfig[item.category as keyof typeof categoryConfig] || categoryConfig.cosmetic;
          const CatIcon = catCfg.icon;
          return (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${owned ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                  {GIFT_ICONS[item.icon] || '🎁'}
                </div>
                {owned && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-semibold">
                    <CheckCircle size={12} /> Adquirido
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CatIcon size={12} className={catCfg.color.split(' ')[1]} />
                <span className="text-xs text-gray-400 font-medium">{catCfg.label}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
              <p className="text-gray-500 text-xs mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-600">{item.cost_points} pts</span>
                {!owned && (
                  <button
                    onClick={() => purchaseItem(item)}
                    disabled={!canAfford || purchasing === item.id}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      canAfford
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {purchasing === item.id ? 'Comprando...' : canAfford ? 'Comprar' : 'Pontos insuf.'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase history */}
      {purchases.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold text-gray-900 mb-4">Histórico de compras</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {purchases.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{items.find(i => i.id === p.item_id)?.name || 'Item'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-amber-600 font-medium">-{p.paid_points} pts</span>
                  <span className="text-gray-400 text-xs">{new Date(p.purchased_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
