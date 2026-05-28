import { Team, User, Score, Document, Announcement } from '../types';

let teams: Team[] = [
  { id: '1', name: '红队', createdAt: new Date('2024-01-01') },
  { id: '2', name: '蓝队', createdAt: new Date('2024-01-01') },
  { id: '3', name: '绿队', createdAt: new Date('2024-01-01') },
  { id: '4', name: '黄队', createdAt: new Date('2024-01-01') },
  { id: '5', name: '紫队', createdAt: new Date('2024-01-01') },
];

let users: User[] = [
  { id: 'admin', username: 'admin', password: 'tx@2024!', role: 'admin', teamId: null, createdAt: new Date('2024-01-01') },
  { id: 'user1', username: 'reduser', password: 'Red@2024!', role: 'user', teamId: '1', createdAt: new Date('2024-01-01') },
  { id: 'user2', username: 'blueuser', password: 'Blue@2024!', role: 'user', teamId: '2', createdAt: new Date('2024-01-01') },
  { id: 'user3', username: 'greenuser', password: 'Green@2024!', role: 'user', teamId: '3', createdAt: new Date('2024-01-01') },
];

let scores: Score[] = [
  { id: '1', teamId: '1', points: 150, description: '成功攻破目标系统', timestamp: new Date('2024-01-15') },
  { id: '2', teamId: '1', points: 80, description: '获取敏感数据', timestamp: new Date('2024-01-16') },
  { id: '3', teamId: '2', points: 200, description: '成功防御攻击', timestamp: new Date('2024-01-15') },
  { id: '4', teamId: '2', points: 120, description: '发现并修复漏洞', timestamp: new Date('2024-01-17') },
  { id: '5', teamId: '3', points: 90, description: '渗透测试完成', timestamp: new Date('2024-01-16') },
  { id: '6', teamId: '4', points: 60, description: '提交报告', timestamp: new Date('2024-01-17') },
  { id: '7', teamId: '5', points: 180, description: '成功绕过防火墙', timestamp: new Date('2024-01-18') },
];

let documents: Document[] = [];

export const teamStore = {
  getAll: (): Team[] => teams,
  getById: (id: string): Team | undefined => teams.find(t => t.id === id),
  create: (name: string): Team => {
    const team: Team = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
    };
    teams.push(team);
    return team;
  },
  update: (id: string, name: string): Team | undefined => {
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], name };
      return teams[index];
    }
    return undefined;
  },
  delete: (id: string): boolean => {
    const initialLength = teams.length;
    teams = teams.filter(t => t.id !== id);
    return teams.length !== initialLength;
  },
};

export const userStore = {
  getAll: (): User[] => users,
  getById: (id: string): User | undefined => users.find(u => u.id === id),
  getByUsername: (username: string): User | undefined => users.find(u => u.username === username),
  create: (username: string, password: string, role: 'admin' | 'user', teamId?: string): User => {
    const user: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
      teamId: teamId || null,
      createdAt: new Date(),
    };
    users.push(user);
    return user;
  },
  update: (id: string, data: Partial<User>): User | undefined => {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      return users[index];
    }
    return undefined;
  },
  delete: (id: string): boolean => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    return users.length !== initialLength;
  },
};

export const scoreStore = {
  getAll: (): Score[] => scores,
  getByTeamId: (teamId: string): Score[] => scores.filter(s => s.teamId === teamId),
  create: (teamId: string, points: number, description: string): Score => {
    const score: Score = {
      id: Date.now().toString(),
      teamId,
      points,
      description,
      timestamp: new Date(),
    };
    scores.push(score);
    return score;
  },
  delete: (id: string): boolean => {
    const initialLength = scores.length;
    scores = scores.filter(s => s.id !== id);
    return scores.length !== initialLength;
  },
  getTeamTotalScore: (teamId: string): number => {
    return scores
      .filter(s => s.teamId === teamId)
      .reduce((sum, s) => sum + s.points, 0);
  },
};

export const documentStore = {
  getAll: (): Document[] => documents,
  getByTeamId: (teamId: string): Document[] => documents.filter(d => d.teamId === teamId),
  getById: (id: string): Document | undefined => documents.find(d => d.id === id),
  create: (userId: string, teamId: string, fileName: string, filePath: string): Document => {
    const document: Document = {
      id: Date.now().toString(),
      userId,
      teamId,
      fileName,
      filePath,
      uploadedAt: new Date(),
    };
    documents.push(document);
    return document;
  },
  delete: (id: string): boolean => {
    const initialLength = documents.length;
    documents = documents.filter(d => d.id !== id);
    return documents.length !== initialLength;
  },
};

let announcements: Announcement[] = [
  { id: '1', title: '系统公告', content: '攻防演练正式开始，请各队伍做好准备！', type: 'system', timestamp: new Date('2024-01-15T08:00:00') },
  { id: '2', title: '防守成功', content: '蓝队成功防御红队攻击，获得80分', type: 'score', teamId: '2', teamName: '蓝队', points: 80, timestamp: new Date('2024-01-15T09:15:00') },
  { id: '3', title: '攻击成功', content: '红队成功攻破目标系统，获得100分', type: 'score', teamId: '1', teamName: '红队', points: 100, timestamp: new Date('2024-01-15T10:30:00') },
];

export const announcementStore = {
  getAll: (): Announcement[] => {
    return [...announcements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  getRecent: (limit: number = 10): Announcement[] => {
    return [...announcements]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
  create: (title: string, content: string, type: 'system' | 'score' | 'warning', teamId?: string, teamName?: string, points?: number): Announcement => {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title,
      content,
      type,
      teamId,
      teamName,
      points,
      timestamp: new Date(),
    };
    announcements.push(announcement);
    return announcement;
  },
  delete: (id: string): boolean => {
    const initialLength = announcements.length;
    announcements = announcements.filter(a => a.id !== id);
    return announcements.length !== initialLength;
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};