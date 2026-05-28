import { useState, useEffect, useRef } from 'react';
import { Trophy, Medal, Award, RefreshCw, Clock, Zap, Shield, Target, Activity, AlertTriangle, Wifi } from 'lucide-react';
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
  const [attackMode, setAttackMode] = useState(true);
  const [flickerEffect, setFlickerEffect] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('online');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const loadData = async () => {
    setIsRefreshing(true);
    setFlickerEffect(true);
    setTimeout(() => setFlickerEffect(false), 150);
    
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
        setNetworkStatus('online');
      }
    } catch (err) {
      console.error('Failed to load rankings:', err);
      setNetworkStatus('offline');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    intervalRef.current = setInterval(loadData, 8000);
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
          if (Math.abs(diff) > 0.5) {
            const step = diff * 0.18;
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
          bg: 'bg-gradient-to-br from-yellow-600 via-amber-500 to-yellow-400',
          glow: 'shadow-[0_0_40px_rgba(250,204,21,0.6)]',
          textColor: 'text-yellow-900',
          border: 'border-yellow-300',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-400',
          glow: 'shadow-[0_0_30px_rgba(156,163,175,0.5)]',
          textColor: 'text-gray-900',
          border: 'border-gray-200',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-br from-amber-700 via-amber-600 to-orange-500',
          glow: 'shadow-[0_0_30px_rgba(217,119,6,0.5)]',
          textColor: 'text-white',
          border: 'border-amber-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-slate-800/90 to-slate-900/90',
          glow: 'shadow-[0_0_20px_rgba(96,165,250,0.2)]',
          textColor: 'text-white',
          border: 'border-slate-600/50',
        };
    }
  };

  const getTeamGradient = (index: number) => {
    const gradients = [
      'from-red-600 via-orange-500 to-red-600',
      'from-blue-600 via-cyan-500 to-blue-600',
      'from-green-600 via-emerald-500 to-green-600',
      'from-purple-600 via-pink-500 to-purple-600',
      'from-indigo-600 via-violet-500 to-indigo-600',
    ];
    return gradients[index % gradients.length];
  };

  const totalScore = rankings.reduce((sum, r) => sum + r.totalPoints, 0);
  const maxScore = Math.max(...rankings.map(r => r.totalPoints), 1);

  return (
    <div className={`min-h-screen bg-black overflow-hidden relative ${flickerEffect ? 'flicker' : ''}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[200px]"></div>
        </div>

        <div className="absolute inset-0 opacity-10">
          <div className="grid-pattern"></div>
        </div>

        <div className="absolute inset-0 opacity-[0.03]">
          <div className="scanline"></div>
        </div>

        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${Math.random() * 300 + 100}px`,
                animationDelay: `${Math.random() * 5}s`,
                animation: `fall ${Math.random() * 3 + 3}s linear infinite`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-6 md:mb-10">
            <div className="flex items-center justify-center gap-3 md:gap-6 mb-3 md:mb-6">
              <div className="relative">
                <div className="w-14 md:w-20 lg:w-24 h-14 md:h-20 lg:h-24 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-purple-500/40 animate-spin-slow">
                  <Trophy className="w-7 md:w-10 lg:w-12 h-7 md:h-10 lg:h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 opacity-40 blur-xl animate-pulse"></div>
              </div>
            </div>
            
            <div className="relative">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-2 md:mb-4 tracking-wider">
                攻防演练
              </h1>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold">
                <span className="text-gradient-cyan">实时</span>
                <span className="text-gray-500 mx-2 md:mx-4">|</span>
                <span className="text-gradient-red">排行榜</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-4 md:mt-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <Clock className="w-4 md:w-5 h-4 md:h-5 text-cyan-400" />
                <span className="font-mono text-cyan-300">{formatTime(lastUpdate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${networkStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={networkStatus === 'online' ? 'text-green-400' : 'text-red-400'}>
                  {networkStatus === 'online' ? '实时同步' : '连接断开'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400">延迟: 23ms</span>
              </div>
              
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-slate-800/70 hover:bg-slate-700/70 backdrop-blur-sm rounded-lg text-gray-300 hover:text-white transition-all border border-slate-600/50 hover:border-cyan-500/50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-4">
              <div className={`flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2 rounded-lg ${attackMode ? 'bg-red-900/40 border border-red-500/40' : 'bg-slate-800/50 border border-slate-600/50'}`}>
                <Zap className={`w-4 h-4 ${attackMode ? 'text-red-400' : 'text-gray-400'}`} />
                <span className={`text-sm ${attackMode ? 'text-red-400' : 'text-gray-400'}`}>攻击模式: {attackMode ? 'ON' : 'OFF'}</span>
              </div>
              <div className="flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">防御状态: ACTIVE</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-10">
            {rankings.map((team, index) => {
              const rank = index + 1;
              const style = getRankStyle(rank);
              const isTopThree = rank <= 3;
              const displayScore = animatedScores.get(team.teamId)?.displayValue || team.totalPoints;
              const teamGradient = getTeamGradient(index);
              const scorePercentage = (team.totalPoints / maxScore) * 100;

              return (
                <div
                  key={team.teamId}
                  className={`relative rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 ${style.bg} ${style.border} border ${style.glow} transform transition-all duration-700 hover:scale-105`}
                  style={{
                    animation: `slideIn 0.7s ease-out forwards`,
                    animationDelay: `${index * 120}ms`,
                    opacity: 0,
                  }}
                >
                  {isTopThree && (
                    <div className="absolute -top-4 md:-top-6 lg:-top-8 left-1/2 -translate-x-1/2">
                      <div className={`w-10 md:w-12 lg:w-14 h-10 md:h-12 lg:h-14 rounded-full ${style.bg} flex items-center justify-center border-3 ${style.border} shadow-lg animate-bounce-slow`}>
                        {rank === 1 && <Trophy className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7" />}
                        {rank === 2 && <Medal className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7" />}
                        {rank === 3 && <Award className="w-5 md:w-6 lg:w-7 h-5 md:h-6 lg:h-7" />}
                      </div>
                    </div>
                  )}

                  <div className={`text-center ${isTopThree ? 'pt-4 md:pt-6 lg:pt-8' : ''}`}>
                    {!isTopThree && (
                      <div className={`inline-block w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br ${teamGradient} flex items-center justify-center ${style.textColor} mb-2 md:mb-3`}>
                        <span className="text-lg md:text-xl font-bold">{rank}</span>
                      </div>
                    )}

                    <h3 className={`text-lg md:text-xl lg:text-2xl font-bold ${style.textColor} mb-1 md:mb-2 tracking-wider`}>
                      {team.teamName}
                    </h3>

                    <div className="relative">
                      <div className={`text-2xl md:text-3xl lg:text-4xl font-black ${style.textColor} font-mono`}>
                        {Math.round(displayScore).toLocaleString()}
                      </div>
                      <div className={`text-xs md:text-sm ${style.textColor} opacity-70`}>积分</div>
                    </div>

                    <div className={`mt-2 md:mt-3 h-1 md:h-1.5 lg:h-2 rounded-full overflow-hidden bg-black/30`}>
                      <div 
                        className={`h-full bg-gradient-to-r ${teamGradient} transition-all duration-1000`}
                        style={{ width: `${Math.min(100, scorePercentage)}%` }}
                      ></div>
                    </div>

                    {rank === 1 && (
                      <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3">
                        <div className="w-6 md:w-8 h-6 md:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                          <span className="text-sm md:text-lg">🏆</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 rounded-xl p-4 md:p-6 border border-red-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg bg-red-600/30 flex items-center justify-center">
                    <Target className="w-5 md:w-6 h-5 md:h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-red-300">攻击次数</p>
                    <p className="text-2xl md:text-4xl font-bold text-red-400 font-mono">
                      {Math.floor(Math.random() * 500 + 800)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-red-400">+12.5%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-red-900/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 w-3/4 animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 rounded-xl p-4 md:p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg bg-green-600/30 flex items-center justify-center">
                    <Shield className="w-5 md:w-6 h-5 md:h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-green-300">成功防御</p>
                    <p className="text-2xl md:text-4xl font-bold text-green-400 font-mono">
                      {Math.floor(Math.random() * 400 + 600)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-400">+8.3%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-green-900/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-emerald-500 w-4/5 animate-pulse"></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 rounded-xl p-4 md:p-6 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-lg bg-yellow-600/30 flex items-center justify-center">
                    <AlertTriangle className="w-5 md:w-6 h-5 md:h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-yellow-300">漏洞发现</p>
                    <p className="text-2xl md:text-4xl font-bold text-yellow-400 font-mono">
                      {Math.floor(Math.random() * 30 + 15)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-yellow-400">+5.2%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-yellow-900/50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-4 md:p-6 border border-cyan-500/20 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg md:text-xl font-bold text-white">实时数据流</h3>
            </div>
            
            <div className="overflow-hidden rounded-lg bg-black/30">
              <div className="marquee">
                {[...rankings, ...rankings].map((team, index) => {
                  const teamGradient = getTeamGradient(index % rankings.length);
                  return (
                    <div key={`${team.teamId}-${index}`} className="flex items-center gap-4 md:gap-6 px-4 md:px-8 whitespace-nowrap">
                      <div className={`w-6 md:w-8 h-6 md:h-8 rounded-full bg-gradient-to-br ${teamGradient} flex items-center justify-center text-white font-bold text-sm`}>
                        {((index % rankings.length) + 1)}
                      </div>
                      <span className="text-white font-semibold text-sm md:text-base">{team.teamName}</span>
                      <span className="text-cyan-400 font-mono text-sm md:text-base">{team.totalPoints.toLocaleString()} 积分</span>
                      <span className="text-gray-600">|</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-xl p-4 md:p-6 border border-slate-700/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">总积分</p>
                  <p className="text-xl md:text-2xl font-bold text-white font-mono">{totalScore.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400">
                <span>数据每8秒自动刷新</span>
                <span>|</span>
                <span>攻防演练系统 v2.0</span>
                <span>|</span>
                <span className="text-cyan-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  实时监控中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes fall {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .marquee { display: flex; animation: marquee 35s linear infinite; }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 116, 139, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          width: 100%;
          height: 100%;
        }
        
        .scanline {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0, 0, 0, 0.05) 3px,
            rgba(0, 0, 0, 0.05) 6px
          );
        }
        
        .flicker { animation: flicker 0.15s ease-out; }
        
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
