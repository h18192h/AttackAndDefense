import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Users, Trophy, Plus, Edit2, Trash2, User, Star, AlertCircle, X, Check } from 'lucide-react';
import { useAuthStore, useAppStore } from '../hooks/useStore';
import { teamApi, userApi, scoreApi, Team, User as UserType, Score, TeamScore } from '../lib/api';

type TabType = 'teams' | 'users' | 'scores';

interface ModalState {
  type: 'createTeam' | 'editTeam' | 'createUser' | 'editUser' | 'addScore' | null;
  data: any;
}

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const triggerRefresh = useAppStore((state) => state.triggerRefresh);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [rankings, setRankings] = useState<TeamScore[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null, data: null });
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    teamId: '',
    points: 0,
    description: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    const [teamsRes, usersRes, scoresRes, rankingsRes] = await Promise.all([
      teamApi.getAll(),
      userApi.getAll(),
      scoreApi.getAll(),
      scoreApi.getRanking(),
    ]);
    if (teamsRes.success) setTeams(teamsRes.data);
    if (usersRes.success) setUsers(usersRes.data);
    if (scoresRes.success) setScores(scoresRes.data);
    if (rankingsRes.success) setRankings(rankingsRes.data);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openModal = (type: ModalState['type'], data?: any) => {
    setModal({ type, data });
    setFormData({
      name: data?.name || '',
      username: data?.username || '',
      password: '',
      role: data?.role || 'user',
      teamId: data?.teamId || '',
      points: 0,
      description: '',
    });
    setMessage('');
  };

  const closeModal = () => {
    setModal({ type: null, data: null });
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'user',
      teamId: '',
      points: 0,
      description: '',
    });
    setMessage('');
  };

  const handleSubmit = async () => {
    let result;
    try {
      switch (modal.type) {
        case 'createTeam':
          result = await teamApi.create(formData.name);
          if (result.success) {
            setMessage('队伍创建成功');
            loadData();
            triggerRefresh();
          } else {
            setMessage(result.message || '创建失败');
          }
          break;
        case 'editTeam':
          result = await teamApi.update(modal.data.id, formData.name);
          if (result.success) {
            setMessage('队伍更新成功');
            loadData();
            triggerRefresh();
          } else {
            setMessage(result.message || '更新失败');
          }
          break;
        case 'createUser':
          result = await userApi.create(formData.username, formData.password, formData.role, formData.teamId || undefined);
          if (result.success) {
            setMessage('用户创建成功');
            loadData();
          } else {
            setMessage(result.message || '创建失败');
          }
          break;
        case 'editUser':
          result = await userApi.update(modal.data.id, {
            username: formData.username,
            role: formData.role,
            teamId: formData.teamId || null,
          });
          if (result.success) {
            setMessage('用户更新成功');
            loadData();
          } else {
            setMessage(result.message || '更新失败');
          }
          break;
        case 'addScore':
          result = await scoreApi.create(formData.teamId, formData.points, formData.description);
          if (result.success) {
            setMessage('分数添加成功');
            loadData();
            triggerRefresh();
          } else {
            setMessage(result.message || '添加失败');
          }
          break;
      }
    } catch (err) {
      setMessage('操作失败');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    const result = await teamApi.delete(id);
    if (result.success) {
      loadData();
      triggerRefresh();
    }
  };

  const handleDeleteUser = async (id: string) => {
    const result = await userApi.delete(id);
    if (result.success) {
      loadData();
    }
  };

  const handleDeleteScore = async (id: string) => {
    const result = await scoreApi.delete(id);
    if (result.success) {
      loadData();
      triggerRefresh();
    }
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return '无队伍';
    return teams.find(t => t.id === teamId)?.name || '未知';
  };

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
                <p className="text-xs text-gray-400">管理员后台</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-5 h-5" />
                <span className="text-sm">{user?.username}</span>
                <span className="text-xs px-2 py-0.5 bg-red-600/30 text-red-300 rounded-full">管理员</span>
              </div>
              <button
                onClick={() => navigate('/screen')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm">大屏展示</span>
              </button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">队伍数量</p>
                <p className="text-3xl font-bold text-white">{teams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600/30 flex items-center justify-center">
                <User className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">用户数量</p>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-600/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">总积分</p>
                <p className="text-3xl font-bold text-white">{rankings.reduce((sum, r) => sum + r.totalPoints, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'teams' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              队伍管理
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'users' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'scores' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              分数管理
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'teams' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">队伍列表</h2>
                  <button
                    onClick={() => openModal('createTeam')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    创建队伍
                  </button>
                </div>
                <div className="space-y-3">
                  {teams.map(team => (
                    <div key={team.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{team.name}</p>
                        <p className="text-sm text-gray-500">ID: {team.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('editTeam', team)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">用户列表</h2>
                  <button
                    onClick={() => openModal('createUser')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    创建用户
                  </button>
                </div>
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-sm text-gray-500">
                          角色: {user.role === 'admin' ? '管理员' : '普通用户'} | 队伍: {getTeamName(user.teamId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('editUser', user)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'scores' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white">分数记录</h2>
                  <button
                    onClick={() => openModal('addScore')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加分数
                  </button>
                </div>
                <div className="space-y-3">
                  {scores.map(score => (
                    <div key={score.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div>
                        <p className="font-medium text-white">{getTeamName(score.teamId)}</p>
                        <p className="text-sm text-gray-400">{score.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-green-400">+{score.points}</span>
                        <button
                          onClick={() => handleDeleteScore(score.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4">实时排名</h3>
                  <div className="space-y-3">
                    {rankings.map((team, index) => (
                      <div key={team.teamId} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-yellow-900' :
                            index === 1 ? 'bg-gray-400 text-gray-900' :
                            index === 2 ? 'bg-amber-600 text-amber-100' :
                            'bg-slate-600 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-white">{team.teamName}</span>
                        </div>
                        <span className="text-xl font-bold text-purple-400">{team.totalPoints}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {modal.type && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {modal.type === 'createTeam' && '创建队伍'}
                {modal.type === 'editTeam' && '编辑队伍'}
                {modal.type === 'createUser' && '创建用户'}
                {modal.type === 'editUser' && '编辑用户'}
                {modal.type === 'addScore' && '添加分数'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                message.includes('成功') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {message.includes('成功') ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message}
              </div>
            )}

            <div className="space-y-4">
              {(modal.type === 'createTeam' || modal.type === 'editTeam') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">队伍名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入队伍名称"
                  />
                </div>
              )}

              {(modal.type === 'createUser' || modal.type === 'editUser') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">用户名</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入用户名"
                    />
                  </div>
                  {modal.type === 'createUser' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">密码</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="请输入密码"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">角色</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="user">普通用户</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">所属队伍</label>
                    <select
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">无队伍</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {modal.type === 'addScore' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">选择队伍</label>
                    <select
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">请选择队伍</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">分数</label>
                    <input
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="请输入分数"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      placeholder="请输入分数描述"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}