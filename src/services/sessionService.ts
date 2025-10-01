import api from './api';

export interface UserSession {
  id: number;
  deviceType: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface SessionsResponse {
  sessions: UserSession[];
  total: number;
}

class SessionService {
  /**
   * Get all active sessions for current user
   */
  async getSessions(): Promise<SessionsResponse> {
    const response = await api.get('/sessions');
    return response.data;
  }

  /**
   * Delete a specific session
   */
  async deleteSession(sessionId: number): Promise<{ isCurrentSession: boolean }> {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Delete all other sessions except current
   */
  async deleteAllOtherSessions(): Promise<void> {
    await api.delete('/sessions/others/all');
  }

  /**
   * Update session activity (optional)
   */
  async updateActivity(): Promise<void> {
    await api.patch('/sessions/activity');
  }
}

export const sessionService = new SessionService();
