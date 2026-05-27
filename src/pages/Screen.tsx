import { useState, useEffect, useRef } from 'react';
import { Trophy, Medal, Award, RefreshCw, Clock } from 'lucide-react';
import { scoreApi, TeamScore } from '../lib/api';

export default function Screen() {
  const [rankings, setRankings] = useState<TeamScore[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const result = await scoreApi.getRanking();
      if (result.success) {
        setRankings(result.data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, 10000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-amber-500',
          textColor: 'text-yellow-900',
          border: 'border-yellow-300',
          shadow: 'shadow-yellow-500/50',
          icon: <Trophy className="w-16 h-16" />,
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-400',
          textColor: 'text-gray-900',
          border: 'border-gray-200',
          shadow: 'shadow-gray-400/50',
          icon: <Medal className="w-16 h-16" />,
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500',
          textColor: 'text-amber-100',
          border: 'border-amber-400',
          shadow: 'shadow-amber-600/50',
          icon: <Award className="w-16 h-16" />,
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-700 to-slate-800',
          textColor: 'text-white',
          border: 'border-slate-600',
          shadow: 'shadow-slate-700/50',
          icon: null,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-2">
            攻防演练实时排行榜
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-mono">{formatTime(lastUpdate)}</span>
            </div>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankings.map((team, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);
            const isTopThree = rank <= 3;
            
            return (
              <div
                key={team.teamId}
                className={`relative rounded-2xl p-6 ${style.bg} ${style.border} border-2 shadow-2xl ${style.shadow} transform transition-all duration-500 hover:scale-105`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0,
                }}
              >
                {isTopThree && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <div className={`w-20 h-20 rounded-full ${style.bg} flex items-center justify-center border-4 ${style.border} shadow-lg`}>
                      {style.icon}
                    </div>
                  </div>
                )}

                <div className={`text-center ${isTopThree ? 'pt-12' : ''}`}>
                  {!isTopThree && (
                    <div className={`inline-block w-12 h-12 rounded-full bg-slate-600/50 flex items-center justify-center mb-4 ${style.textColor}`}>
                      <span className="text-2xl font-bold">{rank}</span>
                    </div>
                  )}

                  <h3 className={`text-2xl md:text-3xl font-bold ${style.textColor} mb-2`}>
                    {team.teamName}
                  </h3>

                  <div className="mt-4">
                    <div className={`text-6xl md:text-7xl font-black ${style.textColor} mb-2`}>
                      {team.totalPoints.toLocaleString()}
                    </div>
                    <div className={`text-lg ${style.textColor} opacity-80`}>
                      积分
                    </div>
                  </div>
                </div>

                {rank === 1 && (
                  <div className="absolute -top-4 -right-4">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      <span className="text-3xl">🏆</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {rankings.slice(0, 4).map((team, index) => (
            <div
              key={team.teamId}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-500 text-yellow-900' :
                  index === 1 ? 'bg-gray-400 text-gray-900' :
                  index === 2 ? 'bg-amber-600 text-amber-100' :
                  'bg-slate-600 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{team.teamName}</p>
                  <p className="text-sm text-gray-400">队伍</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-purple-400">{team.totalPoints}</p>
                  <p className="text-xs text-gray-500">积分</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center text-gray-500">
          <p>数据每10秒自动刷新</p>
          <p className="text-sm mt-1">攻防演练系统 - 大屏展示</p>
        </footer>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}