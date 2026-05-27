export interface Team {
  id: string;
  name: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  teamId: string | null;
  createdAt: Date;
}

export interface Score {
  id: string;
  teamId: string;
  points: number;
  description: string;
  timestamp: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface CreateTeamRequest {
  name: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: 'admin' | 'user';
  teamId?: string;
}

export interface UpdateScoreRequest {
  teamId: string;
  points: number;
  description: string;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  totalPoints: number;
}

export interface UploadDocumentRequest {
  userId: string;
  teamId: string;
  fileName: string;
  content: string;
}

export interface Document {
  id: string;
  userId: string;
  teamId: string;
  fileName: string;
  content: string;
  uploadedAt: Date;
}