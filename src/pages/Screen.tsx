import { useState, useEffect, useRef } from 'react';
import { Trophy, Medal, Award, RefreshCw, Clock, Zap, Shield, Target, Activity, AlertTriangle } from 'lucide-react';
import { scoreApi, TeamScore } from '../lib/api';

interface AnimatedNumber {
  value: number;
  displayValue: number;
}

export default function Screen() {
  const [rankings, setRankings] = useState<TeamScore[]>([]);
  const [animatedScores, setAnimatedScores] = useState<Map<string, AnimatedNumber>>(new Map());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [attackMode, setAttackMode] = useState(false);
  const [flickerEffect, setFlickerEffect] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    setFlickerEffect(true);
    setTimeout(() => setFlickerEffect(false), 200);
    
    try {
      const result = await scoreApi.getRanking();
      if (result.success) {
        const newRankings = result.data;
        
        setAnimatedScores(prev => {
          const newMap = new Map(prev);
          newRankings.forEach(team => {
            const current = prev.get(team.teamId);
            const targetValue = team.totalPoints;
            if (current) {
              newMap.set(team.teamId, {
                value: targetValue,
                displayValue: current.displayValue,
              });
            } else {
              newMap.set(team.teamId, {
                value: targetValue,
                displayValue: 0,
              });
            }
          });
          return newMap;
        });
        
        setRankings(newRankings);
        setLastUpdate(new Date());
        
        setAttackMode(prev => !prev);
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setAnimatedScores(prev => {
        const newMap = new Map(prev);
        let needsUpdate = false;
        
        newMap.forEach((score, key) => {
          const diff = score.value - score.displayValue;
          if (Math.abs(diff) > 1) {
            const step = diff * 0.15;
            newMap.set(key, {
              ...score,
              displayValue: score.displayValue + step,
            });
            needsUpdate = true;
          } else {
            newMap.set(key, {
              ...score,
              displayValue: score.value,
            });
          }
        });
        
        if (needsUpdate) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
        
        return newMap;
      });
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [rankings]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-br from-yellow-600 via-yellow-500 to-amber-500',
          glow: 'shadow-[0_0_30px_rgba(250,204,21,0.5)]',
          textColor: 'text-yellow-900',
          border: 'border-yellow-300',
          pulse: 'animate-pulse-yellow',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-400',
          glow: 'shadow-[0_0_30px_rgba(156,163,175,0.5)]',
          textColor: 'text-gray-900',
          border: 'border-gray-200',
          pulse: 'animate-pulse-gray',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-amber-700 via-amber-600 to-orange-600',
          glow: 'shadow-[0_0_30px_rgba(217,119,6,0.5)]',
          textColor: 'text-amber-100',
          border: 'border-amber-400',
          pulse: 'animate-pulse-amber',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-800/80 to-slate-900/80',
          glow: 'shadow-[0_0_20px_rgba(100,116,139,0.3)]',
          textColor: 'text-white',
          border: 'border-slate-700/50',
          pulse: '',
        };
    }
  };

  const getTeamColor = (index: number) => {
    const colors = [
      'from-red-600 to-orange-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-emerald-600',
      'from-purple-600 to-pink-600',
      'from-indigo-600 to-violet-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`min-h-screen bg-black overflow-hidden relative ${flickerEffect ? 'flicker' : ''}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="absolute inset-0 opacity-20">
          <div className="grid-pattern"></div>
        </div>

        <div className="absolute inset-0">
          <div className="scanline"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <div className="relative">
                <div className="w-16 md:w-24 h-16 md:h-24 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-spin-slow">
                  <Trophy className="w-8 md:w-12 h-8 md:h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 opacity-50 blur-xl"></div>
              </div>
            </div>
            
            <div className="relative">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2 md:mb-4 tracking-wider">
                攻防演练
              </h1>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white/90">
                <span className="text-gradient-cyan">实时</span>
                <span className="mx-2">|</span>
                <span className="text-gradient-red">排行榜</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8 text-gray-400">
              <div className="flex items-center gap-2 md:gap-3">
                <Clock className="w-4 md:w-5 h-4 md:h-5 text-cyan-400" />
                <span className="text-sm md:text-lg font-mono text-cyan-300">{formatTime(lastUpdate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-green-400">实时同步</span>
              </div>
              
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-slate-800/60 hover:bg-slate-700/60 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white transition-all border border-slate-600/50 hover:border-cyan-500/50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm">刷新</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">攻击模式: {attackMode ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">防御状态: ACTIVE</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
            {rankings.map((team, index) => {
              const rank = index + 1;
              const style = getRankStyle(rank);
              const isTopThree = rank <= 3;
              const displayScore = animatedScores.get(team.teamId)?.displayValue || team.totalPoints;
              const teamColor = getTeamColor(index);

              return (
                <div
                  key={team.teamId}
                  className={`relative rounded-2xl p-4 md:p-6 ${style.bg} ${style.border} border ${style.glow} ${style.pulse} transform transition-all duration-500 hover:scale-105 hover:shadow-xl`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideIn 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  {isTopThree && (
                    <div className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2">
                      <div className={`w-12 md:w-16 h-12 md:h-16 rounded-full ${style.bg} flex items-center justify-center border-4 ${style.border} shadow-lg animate-bounce-slow`}>
                        {rank === 1 && <Trophy className="w-6 md:w-8 h-6 md:h-8" />}
                        {rank === 2 && <Medal className="w-6 md:w-8 h-6 md:h-8" />}
                        {rank === 3 && <Award className="w-6 md:w-8 h-6 md:h-8" />}
                      </div>
                    </div>
                  )}

                  <div className={`text-center ${isTopThree ? 'pt-8 md:pt-12' : ''}`}>
                    {!isTopThree && (
                      <div className={`inline-block w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${teamColor} flex items-center justify-center mb-3 md:mb-4 ${style.textColor}`}>
                        <span className="text-xl md:text-2xl font-bold">{rank}</span>
                      </div>
                    )}

                    <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold ${style.textColor} mb-2 md:mb-3 tracking-wider`}>
                      {team.teamName}
                    </h3>

                    <div className="relative">
                      <div className={`text-3xl md:text-4xl lg:text-5xl font-black ${style.textColor} mb-1 md:mb-2 font-mono`}>
                        {Math.round(displayScore).toLocaleString()}
                      </div>
                      <div className={`text-sm md:text-base ${style.textColor} opacity-70`}>
                        积分
                      </div>
                    </div>

                    <div className={`mt-3 md:mt-4 h-1 md:h-2 rounded-full overflow-hidden bg-black/30`}>
                      <div 
                        className={`h-full bg-gradient-to-r ${teamColor} transition-all duration-1000`}
                        style={{ width: `${Math.min(100, (team.totalPoints / Math.max(...rankings.map(t => t.totalPoints)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {rank === 1 && (
                    <>
                      <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4">
                        <div className="w-10 md:w-14 h-10 md:h-14 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                          <span className="text-xl md:text-2xl">🏆</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/50 animate-pulse"></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700/50 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl md:text-2xl font-bold text-white">实时数据流</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-xl p-4 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-300">攻击次数</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-red-400 font-mono">
                  {Math.floor(Math.random() * 1000 + 500)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-green-300">成功防御</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-green-400 font-mono">
                  {Math.floor(Math.random() * 800 + 300)}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-yellow-300">漏洞发现</span>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 font-mono">
                  {Math.floor(Math.random() * 50 + 10)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-slate-700/30">
            <div className="overflow-hidden">
              <div className="marquee">
                {[...rankings, ...rankings].map((team, index) => (
                  <div key={`${team.teamId}-${index}`} className="flex items-center gap-6 px-8 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                      {((index % rankings.length) + 1)}
                    </div>
                    <span className="text-white font-semibold">{team.teamName}</span>
                    <span className="text-cyan-400 font-mono">{team.totalPoints.toLocaleString()} 积分</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="mt-12 text-center">
            <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
              <span>数据每10秒自动刷新</span>
              <span>|</span>
              <span>攻防演练系统 v2.0</span>
              <span>|</span>
              <span className="text-cyan-500">实时监控中</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-600">系统运行正常</span>
            </div>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-10px);
          }
        }
        
        @keyframes pulse-yellow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(250, 204, 21, 0.8);
          }
        }
        
        @keyframes pulse-gray {
          0%, 100% {
            box-shadow: 0 0 20px rgba(156, 163, 175, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(156, 163, 175, 0.8);
          }
        }
        
        @keyframes pulse-amber {
          0%, 100% {
            box-shadow: 0 0 20px rgba(217, 119, 6, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(217, 119, 6, 0.8);
          }
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-yellow {
          animation: pulse-yellow 2s ease-in-out infinite;
        }
        
        .animate-pulse-gray {
          animation: pulse-gray 2s ease-in-out infinite;
        }
        
        .animate-pulse-amber {
          animation: pulse-amber 2s ease-in-out infinite;
        }
        
        .marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          width: 100%;
          height: 100%;
        }
        
        .scanline {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          );
          pointer-events: none;
        }
        
        .flicker {
          animation: flicker 0.1s ease-out;
        }
        
        @keyframes flicker {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .text-gradient-cyan {
          background: linear-gradient(to right, #22d3ee, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .text-gradient-red {
          background: linear-gradient(to right, #f87171, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
