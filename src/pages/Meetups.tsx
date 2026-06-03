import { useState, useEffect } from 'react';
import { MapPin, Coffee, TreePine, Building, BookOpen, Navigation, Search, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SafePlace } from '../types';

const typeConfig = {
  cafe: { label: 'Cafe', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
  park: { label: 'Parque', icon: TreePine, color: 'bg-emerald-100 text-emerald-700' },
  museum: { label: 'Museu', icon: Building, color: 'bg-blue-100 text-blue-700' },
  library: { label: 'Biblioteca', icon: BookOpen, color: 'bg-gray-100 text-gray-700' },
};

export default function Meetups() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', description: '', place_type: 'cafe', address: '', city: '', latitude: '', longitude: '' });
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('safe_places').select('*').order('city');
    setPlaces(data || []);
    setLoading(false);
  }

  async function addPlace() {
    if (!user || !newPlace.name.trim()) return;
    setAdding(true);
    await supabase.from('safe_places').insert({
      ...newPlace,
      latitude: parseFloat(newPlace.latitude) || 0,
      longitude: parseFloat(newPlace.longitude) || 0,
      added_by: user.id,
    });
    await load();
    setShowAdd(false);
    setNewPlace({ name: '', description: '', place_type: 'cafe', address: '', city: '', latitude: '', longitude: '' });
    setAdding(false);
  }

  const filtered = places.filter(p => {
    const matchFilter = filter === 'all' || p.place_type === filter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const cities = [...new Set(places.map(p => p.city))];

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Encontros Saudaveis</h1>
          <p className="text-gray-500 mt-1">Locais verificados para encontros presenciais da Tribo.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} /> Sugerir local
        </button>
      </div>

      {/* Map placeholder */}
      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <MapPin key={i} className="absolute text-emerald-600" size={16 + (i % 3) * 8}
              style={{ left: `${(i * 31) % 90 + 5}%`, top: `${(i * 47) % 80 + 10}%` }} />
          ))}
        </div>
        <div className="relative">
          <MapPin className="mx-auto text-emerald-600 mb-3" size={36} />
          <h2 className="font-bold text-emerald-800 text-lg mb-2">Mapa de encontros</h2>
          <p className="text-emerald-700 text-sm max-w-md mx-auto">
            Cafés, parques, museus e bibliotecas — espaços sem foco em álcool ou tabaco para encontros presenciais seguros da sua Tribo.
          </p>
          <p className="text-emerald-600 text-xs mt-3 font-medium">{places.length} locais cadastrados em {cities.length} cidades</p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por nome, cidade ou endereço..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        </div>
        <div className="flex gap-2">
          {([['all', 'Todos'], ['cafe', 'Cafés'], ['park', 'Parques'], ['museum', 'Museus'], ['library', 'Bibliotecas']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === val ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Places grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(p => {
          const cfg = typeConfig[p.place_type as keyof typeof typeConfig] || typeConfig.cafe;
          const CfgIcon = cfg.icon;
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <CfgIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{p.name}</h3>
                    {p.is_verified && (
                      <span className="flex-shrink-0 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">Verificado</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">{p.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={11} />
                    <span className="truncate">{p.address}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color} font-medium`}>{cfg.label}</span>
                    <span className="text-xs text-gray-400">{p.city}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MapPin className="mx-auto mb-3 text-gray-300" size={32} />
          <p>Nenhum local encontrado.</p>
        </div>
      )}

      {/* Add place modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">Sugerir local seguro</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do local</label>
                <input type="text" value={newPlace.name} onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))}
                  placeholder="ex: Cafe Siropa" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(typeConfig) as [string, typeof typeConfig[keyof typeof typeConfig]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setNewPlace(p => ({ ...p, place_type: key }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all ${
                        newPlace.place_type === key ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <cfg.icon size={14} /> {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereco</label>
                <input type="text" value={newPlace.address} onChange={e => setNewPlace(p => ({ ...p, address: e.target.value }))}
                  placeholder="Rua, número - Bairro" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
                  <input type="text" value={newPlace.city} onChange={e => setNewPlace(p => ({ ...p, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descricao</label>
                  <input type="text" value={newPlace.description} onChange={e => setNewPlace(p => ({ ...p, description: e.target.value }))}
                    placeholder="Ambiente acolhedor..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={addPlace} disabled={adding} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-60">
                {adding ? 'Enviando...' : 'Sugerir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
