import { Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ScoreDisplay() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Award className="text-amber-600" size={20} />
        <div>
          <p className="text-xs text-gray-600 font-medium">Sua Pontuação</p>
          <p className="text-lg font-bold text-gray-900">{profile.total_points || 0} pts</p>
        </div>
      </div>
      <div className="w-px h-10 bg-amber-200" />
      <div className="flex items-center gap-2">
        <TrendingUp className="text-emerald-600" size={20} />
        <div>
          <p className="text-xs text-gray-600 font-medium">Nível</p>
          <p className="text-lg font-bold text-gray-900">{profile.level || 1}</p>
        </div>
      </div>
    </div>
  );
}
