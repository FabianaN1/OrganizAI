import { useState, useEffect } from 'react';
import { Download, Search, Filter, Eye, Clock, Mail, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';

export default function SignupRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState<'all' | 'reduce' | 'quit'>('all');
  const [filterSubstance, setFilterSubstance] = useState<'all' | 'alcohol' | 'tobacco' | 'both'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'points'>('newest');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email !== 'admin@maissaude.com') {
      navigate('/dashboard');
      return;
    }
    loadRecords();
  }, [user, navigate]);

  async function loadRecords() {
    try {
      setLoading(true);
      setError('');

      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        console.error('Erro ao carregar registros:', err);
        setError('Erro ao carregar registros: ' + err.message);
        setRecords([]);
        return;
      }

      setRecords(data || []);
    } catch (err: any) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar registros');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar registros
  let filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (record.id?.includes(searchTerm) || false);

    const matchesGoal = filterGoal === 'all' || record.goal_type === filterGoal;
    const matchesSubstance = filterSubstance === 'all' || record.substance_target === filterSubstance;

    return matchesSearch && matchesGoal && matchesSubstance;
  });

  // Ordenar registros
  filteredRecords.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'name':
        return (a.full_name || '').localeCompare(b.full_name || '');
      case 'points':
        return (b.total_points || 0) - (a.total_points || 0);
      default:
        return 0;
    }
  });

  // Exportar para CSV
  function exportToCSV() {
    const headers = ['Nome', 'Email (ID)', 'Objetivo', 'Substância', 'Data Cadastro', 'Pontos', 'Streak', 'Nível'];
    const rows = filteredRecords.map((record) => [
      record.full_name || 'Sem nome',
      record.id,
      record.goal_type === 'reduce' ? 'Reduzir' : 'Parar',
      record.substance_target === 'both' ? 'Ambos' : record.substance_target === 'alcohol' ? 'Álcool' : 'Tabaco',
      new Date(record.created_at).toLocaleDateString('pt-BR'),
      record.total_points,
      record.streak_days,
      record.level,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registros_cadastro_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  const goalLabel = {
    reduce: 'Reduzir',
    quit: 'Parar',
  };

  const substanceLabel = {
    alcohol: 'Álcool',
    tobacco: 'Tabaco',
    both: 'Ambos',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark">Registros de Cadastro</h1>
                <p className="text-gray-600">Visualize todos os usuários cadastrados na plataforma</p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md"
            >
              <Download size={18} />
              Exportar CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
            <Mail size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Erro ao carregar registros</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => loadRecords()}
                className="mt-2 text-red-600 hover:text-red-700 underline text-sm font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total de Registros</p>
            <p className="text-3xl font-bold text-dark mt-2">{records.length}</p>
            <p className="text-xs text-gray-500 mt-2">Todos os cadastros</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Objetivo: Reduzir</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {records.filter((r) => r.goal_type === 'reduce').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {((records.filter((r) => r.goal_type === 'reduce').length / records.length) * 100 || 0).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Objetivo: Parar</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {records.filter((r) => r.goal_type === 'quit').length}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {((records.filter((r) => r.goal_type === 'quit').length / records.length) * 100 || 0).toFixed(1)}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Última Jornada</p>
            <p className="text-lg font-bold text-dark mt-2">
              {records.length > 0
                ? new Date(records[0].created_at).toLocaleDateString('pt-BR')
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Cadastro mais recente</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros e Busca</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Objetivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="reduce">Reduzir</option>
                <option value="quit">Parar</option>
              </select>
            </div>

            {/* Substância */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Substância</label>
              <select
                value={filterSubstance}
                onChange={(e) => setFilterSubstance(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="alcohol">Álcool</option>
                <option value="tobacco">Tabaco</option>
                <option value="both">Ambos</option>
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Mais Recentes</option>
                <option value="oldest">Mais Antigos</option>
                <option value="name">Por Nome</option>
                <option value="points">Por Pontos</option>
              </select>
            </div>

            {/* Botão Limpar */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterGoal('all');
                  setFilterSubstance('all');
                  setSortBy('newest');
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Mostrando <span className="font-semibold">{filteredRecords.length}</span> de{' '}
            <span className="font-semibold">{records.length}</span> registros
          </p>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email (ID)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Objetivo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Substância</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Data Cadastro</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pontos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Streak</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nível</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {records.length === 0 ? 'Nenhum registro encontrado' : 'Nenhum registro corresponde aos filtros'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.full_name || 'Sem nome'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono truncate max-w-xs">{record.id}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            record.goal_type === 'reduce'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {goalLabel[record.goal_type as keyof typeof goalLabel] || record.goal_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            record.substance_target === 'alcohol'
                              ? 'bg-orange-100 text-orange-700'
                              : record.substance_target === 'tobacco'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {substanceLabel[record.substance_target as keyof typeof substanceLabel] || record.substance_target}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(record.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-amber-600">⭐ {record.total_points}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span className="font-medium">{record.streak_days}</span>
                          <span className="text-gray-500">dias</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-semibold text-primary">
                        Lv.{record.level}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredRecords.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex items-center justify-between">
              <span>Total de {filteredRecords.length} registros exibidos</span>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                <Download size={16} />
                Exportar estes resultados
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
