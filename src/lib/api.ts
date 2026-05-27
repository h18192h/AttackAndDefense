const BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  teamId: string | null;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt: string;
}

export interface Score {
  id: string;
  teamId: string;
  points: number;
  description: string;
  timestamp: string;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  totalPoints: number;
}

export interface Document {
  id: string;
  userId: string;
  teamId: string;
  fileName: string;
  content: string;
  uploadedAt: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
    return response.json();
  },
};

export const teamApi = {
  getAll: async (): Promise<{ success: boolean; data: Team[] }> => {
    const response = await fetch(`${BASE_URL}/teams`);
    return response.json();
  },
  getById: async (id: string): Promise<{ success: boolean; data: Team }> => {
    const response = await fetch(`${BASE_URL}/teams/${id}`);
    return response.json();
  },
  create: async (name: string): Promise<{ success: boolean; data: Team }> => {
    const response = await fetch(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return response.json();
  },
  update: async (id: string, name: string): Promise<{ success: boolean; data: Team }> => {
    const response = await fetch(`${BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return response.json();
  },
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${BASE_URL}/teams/${id}`, { method: 'DELETE' });
    return response.json();
  },
};

export const userApi = {
  getAll: async (): Promise<{ success: boolean; data: User[] }> => {
    const response = await fetch(`${BASE_URL}/users`);
    return response.json();
  },
  getById: async (id: string): Promise<{ success: boolean; data: User }> => {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    return response.json();
  },
  create: async (username: string, password: string, role: 'admin' | 'user', teamId?: string): Promise<{ success: boolean; data: User }> => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role, teamId }),
    });
    return response.json();
  },
  update: async (id: string, data: Partial<User>): Promise<{ success: boolean; data: User }> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
    return response.json();
  },
};

export const scoreApi = {
  getAll: async (): Promise<{ success: boolean; data: Score[] }> => {
    const response = await fetch(`${BASE_URL}/scores`);
    return response.json();
  },
  getByTeamId: async (teamId: string): Promise<{ success: boolean; data: Score[] }> => {
    const response = await fetch(`${BASE_URL}/scores/team/${teamId}`);
    return response.json();
  },
  getRanking: async (): Promise<{ success: boolean; data: TeamScore[] }> => {
    const response = await fetch(`${BASE_URL}/scores/ranking`);
    return response.json();
  },
  create: async (teamId: string, points: number, description: string): Promise<{ success: boolean; data: Score }> => {
    const response = await fetch(`${BASE_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, points, description }),
    });
    return response.json();
  },
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${BASE_URL}/scores/${id}`, { method: 'DELETE' });
    return response.json();
  },
};

export const documentApi = {
  getAll: async (): Promise<{ success: boolean; data: Document[] }> => {
    const response = await fetch(`${BASE_URL}/documents`);
    return response.json();
  },
  getByTeamId: async (teamId: string): Promise<{ success: boolean; data: Document[] }> => {
    const response = await fetch(`${BASE_URL}/documents/team/${teamId}`);
    return response.json();
  },
  create: async (userId: string, teamId: string, fileName: string, content: string): Promise<{ success: boolean; data: Document }> => {
    const response = await fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, teamId, fileName, content }),
    });
    return response.json();
  },
};