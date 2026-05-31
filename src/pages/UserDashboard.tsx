import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Upload, FileText, Trophy, RefreshCw, User, Award, Download, Trash2, Bell, AlertTriangle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuthStore, useAppStore } from '../hooks/useStore';
import { teamApi, scoreApi, documentApi, announcementApi, Team, TeamScore, Document, Announcement } from '../lib/api';

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refreshTrigger = useAppStore((state) => state.refreshTrigger);
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [rankings, setRankings] = useState<TeamScore[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [myTeamScore, setMyTeamScore] = useState<TeamScore | null>(null);
  const [myRank, setMyRank] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const announcementIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadData();
    loadAnnouncements();
    announcementIntervalRef.current = setInterval(loadAnnouncements, 10000);
    return () => {
      if (announcementIntervalRef.current) clearInterval(announcementIntervalRef.current);
    };
  }, [user, navigate, refreshTrigger]);

  const loadAnnouncements = async () => {
    try {
      const result = await announcementApi.getRecent(10, user?.teamId);
      if (result.success) {
        setAnnouncements(result.data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    }
  };

  const getDisplayTeamNames = (announcement: Announcement) => {
    if (!announcement.teamNames) return null;
    try {
      const teamNames = JSON.parse(announcement.teamNames);
      return teamNames.join('、');
    } catch {
      return announcement.teamNames;
    }
  };

  const loadData = async () => {
    const [teamsRes, rankingsRes, docsRes] = await Promise.all([
      teamApi.getAll(),
      scoreApi.getRanking(),
      user?.teamId ? documentApi.getByTeamId(user.teamId) : Promise.resolve({ success: true, data: [] }),
    ]);

    if (teamsRes.success) setTeams(teamsRes.data);
    if (rankingsRes.success) {
      setRankings(rankingsRes.data);
      if (user?.teamId) {
        const myScore = rankingsRes.data.find(r => r.teamId === user.teamId);
        setMyTeamScore(myScore || null);
        setMyRank(rankingsRes.data.findIndex(r => r.teamId === user.teamId) + 1);
      }
    }
    if (docsRes.success) setDocuments(docsRes.data);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log('文件选择:', e.target.files[0].name);
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log('文件拖拽:', e.dataTransfer.files[0].name);
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    console.log('开始上传，当前状态:', {
      hasSelectedFile: !!selectedFile,
      hasUser: !!user,
      hasTeamId: !!user?.teamId,
      userId: user?.id,
      teamId: user?.teamId,
      fileName: selectedFile?.name,
    });

    if (!selectedFile) {
      setMessage('请先选择文件');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!user?.teamId) {
      setMessage('用户没有分配队伍');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    console.log('准备上传文件:', selectedFile.name);

    try {
      const result = await documentApi.create(user.id, user.teamId, selectedFile);
      console.log('上传结果:', result);
      if (result.success) {
        setMessage('文件上传成功');
        setSelectedFile(null);
        loadData();
      } else {
        setMessage(result.message || '上传失败');
      }
    } catch (err) {
      console.error('上传出错:', err);
      setMessage('上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const myTeam = teams.find(t => t.id === user?.teamId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">攻防演练系统</h1>
                <p className="text-xs text-gray-400">普通用户端</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.username}</span>
                <span className="text-xs px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full">
                  {myTeam?.name || '无队伍'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">实时动态公告</h2>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {announcements.map((announcement) => {
                  const getTypeStyle = () => {
                    switch (announcement.type) {
                      case 'score':
                        return {
                          bg: announcement.points && announcement.points >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
                          icon: announcement.points && announcement.points >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />,
                          title: announcement.points && announcement.points >= 0 ? 'text-green-400' : 'text-red-400',
                        };
                      case 'warning':
                        return {
                          bg: 'bg-yellow-500/10',
                          icon: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
                          title: 'text-yellow-400',
                        };
                      default:
                        return {
                          bg: 'bg-blue-500/10',
                          icon: <Info className="w-4 h-4 text-blue-400" />,
                          title: 'text-blue-400',
                        };
                    }
                  };
                  
                  const style = getTypeStyle();
                  const timestamp = new Date(announcement.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                  const displayTeamNames = getDisplayTeamNames(announcement);
                  
                  return (
                    <div key={announcement.id} className={`flex items-start gap-3 p-3 rounded-lg ${style.bg}`}>
                      <div className="mt-0.5">
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${style.title}`}>{announcement.title}</span>
                          <span className="text-xs text-gray-500">{timestamp}</span>
                          {displayTeamNames && (
                            <span className="text-xs px-2 py-0.5 bg-slate-700 rounded-full text-gray-300">
                              {displayTeamNames}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{announcement.content}</p>
                      </div>
                      {announcement.points !== undefined && (
                        <span className={`text-lg font-bold ${announcement.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {announcement.points >= 0 ? '+' : ''}{announcement.points}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  队伍排名
                </h2>
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新
                </button>
              </div>

              <div className="space-y-3">
                {rankings.map((team, index) => (
                  <div
                    key={team.teamId}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      team.teamId === user?.teamId
                        ? 'bg-purple-600/20 border border-purple-500/50'
                        : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
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
                      <p className="text-sm text-gray-400">
                        {team.teamId === user?.teamId ? '我的队伍' : '参赛队伍'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-400">{team.totalPoints}</p>
                      <p className="text-xs text-gray-500">积分</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <FileText className="w-6 h-6 text-blue-400" />
                已上传文档
              </h2>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无上传的文档</p>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-400" />
                        <div>
                          <p className="font-medium text-white">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => documentApi.download(doc.id)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="下载"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={async () => {
                            const result = await documentApi.delete(doc.id);
                            if (result.success) {
                              loadData();
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-4 border-2 border-red-500/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">防守平台信息</h3>
              </div>
              <div className="text-sm space-y-1 text-white/90">
                <p>防守平台URL：<span className="font-mono">https://117.113.42.200:9443</span></p>
                <p>用户名：<span className="font-mono">admin</span></p>
                <p>密码：<span className="font-mono">WzScdZpG</span></p>
                <p>运维机用户名及密码：<span className="font-mono">root/1qaz!QAZ</span></p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6" />
                <h3 className="font-semibold">我的队伍成绩</h3>
              </div>
              <div className="text-5xl font-bold mb-2">{myTeamScore?.totalPoints || 0}</div>
              <p className="text-purple-200">总积分</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-purple-200">当前排名</span>
                  <span className="text-2xl font-bold">#{myRank || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Upload className="w-6 h-6 text-green-400" />
                上传文档
              </h2>

              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="font-medium text-white">报告模板下载</p>
                      <p className="text-xs text-gray-400">下载并填写报告模板</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('/api/documents/template/download', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">下载模板</span>
                  </button>
                </div>
              </div>

              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  message.includes('成功') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver ? 'border-purple-500 bg-purple-900/20' : 'border-slate-600 hover:border-purple-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".txt,.md,.pdf,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">点击或拖拽文件到此处</p>
                  <p className="text-sm text-gray-500">支持 .txt, .md, .pdf, .docx 格式</p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-white">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    取消
                  </button>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '上传中...' : '上传文档'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
