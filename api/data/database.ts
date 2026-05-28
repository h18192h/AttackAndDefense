import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    team_id TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS upload_logs (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
  );
`);

const existingTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
if (existingTeams.count === 0) {
  const insertTeam = db.prepare('INSERT INTO teams (id, name, created_at) VALUES (?, ?, ?)');
  insertTeam.run('1', '红队', '2024-01-01T00:00:00.000Z');
  insertTeam.run('2', '蓝队', '2024-01-01T00:00:00.000Z');
  insertTeam.run('3', '绿队', '2024-01-01T00:00:00.000Z');
  insertTeam.run('4', '黄队', '2024-01-01T00:00:00.000Z');
  insertTeam.run('5', '紫队', '2024-01-01T00:00:00.000Z');

  const insertUser = db.prepare('INSERT INTO users (id, username, password, role, team_id, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('admin', 'admin', 'tx@2024!', 'admin', null, '2024-01-01T00:00:00.000Z');
  insertUser.run('user1', 'reduser', 'Red@2024!', 'user', '1', '2024-01-01T00:00:00.000Z');
  insertUser.run('user2', 'blueuser', 'Blue@2024!', 'user', '2', '2024-01-01T00:00:00.000Z');
  insertUser.run('user3', 'greenuser', 'Green@2024!', 'user', '3', '2024-01-01T00:00:00.000Z');

  const insertScore = db.prepare('INSERT INTO scores (id, team_id, points, description, timestamp) VALUES (?, ?, ?, ?, ?)');
  insertScore.run('1', '1', 150, '成功攻破目标系统', '2024-01-15T10:00:00.000Z');
  insertScore.run('2', '1', 80, '获取敏感数据', '2024-01-16T10:00:00.000Z');
  insertScore.run('3', '2', 200, '成功防御攻击', '2024-01-15T10:00:00.000Z');
  insertScore.run('4', '2', 120, '发现并修复漏洞', '2024-01-17T10:00:00.000Z');
  insertScore.run('5', '3', 90, '渗透测试完成', '2024-01-16T10:00:00.000Z');
  insertScore.run('6', '4', 60, '提交报告', '2024-01-17T10:00:00.000Z');
  insertScore.run('7', '5', 180, '成功绕过防火墙', '2024-01-18T10:00:00.000Z');
}

export default db;

export const teamStore = {
  getAll: () => {
    return db.prepare('SELECT id, name, created_at as createdAt FROM teams ORDER BY created_at').all();
  },
  getById: (id: string) => {
    return db.prepare('SELECT id, name, created_at as createdAt FROM teams WHERE id = ?').get(id);
  },
  create: (name: string) => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    db.prepare('INSERT INTO teams (id, name, created_at) VALUES (?, ?, ?)').run(id, name, createdAt);
    return { id, name, createdAt };
  },
  update: (id: string, name: string) => {
    db.prepare('UPDATE teams SET name = ? WHERE id = ?').run(name, id);
    return { id, name, createdAt: new Date().toISOString() };
  },
  delete: (id: string) => {
    const result = db.prepare('DELETE FROM teams WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const userStore = {
  getAll: () => {
    return db.prepare('SELECT id, username, role, team_id as teamId, created_at as createdAt FROM users').all();
  },
  getById: (id: string) => {
    return db.prepare('SELECT id, username, password, role, team_id as teamId, created_at as createdAt FROM users WHERE id = ?').get(id);
  },
  getByUsername: (username: string) => {
    return db.prepare('SELECT id, username, password, role, team_id as teamId, created_at as createdAt FROM users WHERE username = ?').get(username);
  },
  create: (username: string, password: string, role: string, teamId?: string) => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    db.prepare('INSERT INTO users (id, username, password, role, team_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, username, password, role, teamId || null, createdAt);
    return { id, username, role, teamId: teamId || null, createdAt };
  },
  update: (id: string, data: any) => {
    const updates: string[] = [];
    const values: any[] = [];
    if (data.username) { updates.push('username = ?'); values.push(data.username); }
    if (data.role) { updates.push('role = ?'); values.push(data.role); }
    if (data.teamId !== undefined) { updates.push('team_id = ?'); values.push(data.teamId); }
    if (data.password) { updates.push('password = ?'); values.push(data.password); }
    
    if (updates.length > 0) {
      values.push(id);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    return db.prepare('SELECT id, username, role, team_id as teamId, created_at as createdAt FROM users WHERE id = ?').get(id);
  },
  delete: (id: string) => {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const scoreStore = {
  getAll: () => {
    return db.prepare('SELECT id, team_id as teamId, points, description, timestamp FROM scores ORDER BY timestamp DESC').all();
  },
  getByTeamId: (teamId: string) => {
    return db.prepare('SELECT id, team_id as teamId, points, description, timestamp FROM scores WHERE team_id = ?').all(teamId);
  },
  create: (teamId: string, points: number, description: string) => {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    db.prepare('INSERT INTO scores (id, team_id, points, description, timestamp) VALUES (?, ?, ?, ?, ?)').run(id, teamId, points, description, timestamp);
    return { id, teamId, points, description, timestamp };
  },
  delete: (id: string) => {
    const result = db.prepare('DELETE FROM scores WHERE id = ?').run(id);
    return result.changes > 0;
  },
  getTeamTotalScore: (teamId: string) => {
    const result = db.prepare('SELECT SUM(points) as total FROM scores WHERE team_id = ?').get(teamId) as { total: number | null };
    return result.total || 0;
  },
};

export const documentStore = {
  getAll: () => {
    return db.prepare('SELECT id, user_id as userId, team_id as teamId, file_name as fileName, file_path as filePath, uploaded_at as uploadedAt FROM documents ORDER BY uploaded_at DESC').all();
  },
  getByTeamId: (teamId: string) => {
    return db.prepare('SELECT id, user_id as userId, team_id as teamId, file_name as fileName, file_path as filePath, uploaded_at as uploadedAt FROM documents WHERE team_id = ? ORDER BY uploaded_at DESC').all(teamId);
  },
  getById: (id: string) => {
    return db.prepare('SELECT id, user_id as userId, team_id as teamId, file_name as fileName, file_path as filePath, uploaded_at as uploadedAt FROM documents WHERE id = ?').get(id);
  },
  create: (userId: string, teamId: string, fileName: string, filePath: string) => {
    const id = Date.now().toString();
    const uploadedAt = new Date().toISOString();
    db.prepare('INSERT INTO documents (id, user_id, team_id, file_name, file_path, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, userId, teamId, fileName, filePath, uploadedAt);
    return { id, userId, teamId, fileName, filePath, uploadedAt };
  },
  delete: (id: string) => {
    const result = db.prepare('DELETE FROM documents WHERE id = ?').run(id);
    return result.changes > 0;
  },
};

export const uploadLogStore = {
  getAll: () => {
    return db.prepare('SELECT * FROM upload_logs ORDER BY timestamp DESC').all();
  },
  getByTeamId: (teamId: string) => {
    return db.prepare('SELECT * FROM upload_logs WHERE team_id = ? ORDER BY timestamp DESC').all(teamId);
  },
  create: (documentId: string, userId: string, teamId: string, fileName: string, fileSize: number, action: string) => {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    db.prepare('INSERT INTO upload_logs (id, document_id, user_id, team_id, file_name, file_size, action, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, documentId, userId, teamId, fileName, fileSize, action, timestamp);
    return { id, documentId, userId, teamId, fileName, fileSize, action, timestamp };
  },
};