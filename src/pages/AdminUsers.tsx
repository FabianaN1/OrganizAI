import { useState, useEffect } from 'react';
import { Users, Search, Shield, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../context/PresenceContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { useNavigate } from 'react-router-dom';

const AVATAR_MAP: Record<string, string> = {
  warrior: '⚔️', healer: '🌿', explorer: '🧭', sage: '📖',
  guardian: '🛡️', phoenix: '🔥', mountain: '⛰️', star: '⭐', default: '💚',
};

export default function AdminUsers() {
  const { user, profile } = useAuth();
  const { onlineUsers } = usePresence();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email !== 'admin@maissaude.com') {
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  async function loadUsers() {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        setError('Erro ao carregar usuários: ' + err.message);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      setError('Erro inesperado ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isUserOnline = (userId: string) => onlineUsers.some((u) => u.id === userId);

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.includes(searchTerm)
  );

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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-dark">Painel Administrativo</h1>
              <p className="text-gray-600">Gestão de Usuários da Plataforma</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
            <Heart size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Erro ao carregar dados</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Usuários</p>
                <p className="text-3xl font-bold text-dark mt-2">{users.length}</p>
              </div>
              <Users className="text-primary opacity-20" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Online Agora</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{onlineUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Offline</p>
                <p className="text-3xl font-bold text-gray-500 mt-2">{users.length - onlineUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <LogOut className="text-gray-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avatar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cadastro</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pontos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isOnline = isUserOnline(u.id);
                    const joinDate = new Date(u.created_at).toLocaleDateString('pt-BR');
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-lg shadow-sm">
                            {AVATAR_MAP[u.avatar_key] || AVATAR_MAP.default}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{u.full_name || 'Sem nome'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{u.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{joinDate}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                            ⭐ {u.total_points}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                            <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-gray-600'}`}>
                              {isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
