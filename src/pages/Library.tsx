import { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Clock, Star, Search, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContentItem } from '../types';

const typeConfig = {
  article: { label: 'Artigo', color: 'bg-blue-100 text-blue-700' },
  guide: { label: 'Guia', color: 'bg-emerald-100 text-emerald-700' },
  statistic: { label: 'Estatística', color: 'bg-amber-100 text-amber-700' },
  video: { label: 'Vídeo', color: 'bg-rose-100 text-rose-700' },
};

const substanceColor: Record<string, string> = {
  alcohol: 'bg-orange-50 text-orange-700 border-orange-200',
  tobacco: 'bg-gray-100 text-gray-700 border-gray-200',
  both: 'bg-teal-50 text-teal-700 border-teal-200',
};
const substanceLabel: Record<string, string> = { alcohol: 'Álcool', tobacco: 'Tabaco', both: 'Ambos' };

export default function Library() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'alcohol' | 'tobacco' | 'both'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('content_library').select('*').order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  const filtered = items.filter(item => {
    const matchFilter = filter === 'all' || item.substance_tag === filter;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.summary.toLowerCase().includes(search.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const featured = items.filter(i => i.is_featured);

  if (loading) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Biblioteca científica</h1>
        <p className="text-gray-500 mt-1">Conteúdo validado por especialistas e baseado em evidências.</p>
      </div>

      {/* Source banner */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-sm">Fontes utilizadas nesta biblioteca</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {['OMS/PAHO', 'The Lancet', 'INCA Brasil', 'APA DSM-5', 'NHS', 'BMJ', 'MBRP Research'].map(src => (
            <span key={src} className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/10">{src}</span>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-amber-500" size={16} /> Destaques
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {featured.slice(0, 4).map(item => (
              <ContentCard key={item.id} item={item} featured />
            ))}
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, fonte ou tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
        <div className="flex gap-2">
          {([['all', 'Todos'], ['alcohol', 'Álcool'], ['tobacco', 'Tabaco'], ['both', 'Ambos']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === val ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* All items */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(item => <ContentCard key={item.id} item={item} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="mx-auto mb-3 text-gray-300" size={32} />
          <p>Nenhum conteúdo encontrado para sua busca.</p>
        </div>
      )}
    </div>
  );
}

function ContentCard({ item, featured }: { item: ContentItem; featured?: boolean }) {
  const typeCfg = typeConfig[item.content_type];
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all flex flex-col ${featured ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${typeCfg.color}`}>{typeCfg.label}</span>
          <span className={`text-xs px-2.5 py-1 rounded-lg border ${substanceColor[item.substance_tag]}`}>
            {substanceLabel[item.substance_tag]}
          </span>
        </div>
        {featured && <Star className="text-amber-400 flex-shrink-0" size={16} />}
      </div>

      <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-snug">{item.title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">{item.summary}</p>

      <div className="flex items-center justify-between mt-auto">
        <div>
          <p className="text-xs text-gray-400 font-medium">{item.source_name}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <Clock size={10} />
            {item.reading_time_minutes} min de leitura
          </div>
        </div>
        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium hover:underline"
          >
            Ler <ExternalLink size={11} />
          </a>
        )}
      </div>

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
          <Tag size={10} className="text-gray-300 mt-0.5" />
          {item.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs text-gray-400">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
