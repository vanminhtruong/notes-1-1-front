import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isActive?: boolean;
}

export interface FriendsResponse {
  friends: User[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userService = {
  // Get list of friends/contacts for sharing
  async getFriends(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<FriendsResponse> {
    try {
      console.log('🔍 Calling API /notes/users with params:', params);
      // Use the new notes/users endpoint to get available users for sharing
      const response = await api.get('/notes/users', { params });
      console.log('🔍 API response:', response.data);
      return {
        friends: response.data.users || []
      };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // Fallback: return some test users
      return { 
        friends: [
          { id: 1, name: 'Test User 1', email: 'user1@test.com' },
          { id: 2, name: 'Test User 2', email: 'user2@test.com' },
          { id: 3, name: 'Test User 3', email: 'user3@test.com' }
        ] 
      };
    }
  },

  async searchUsers(query: string): Promise<{ users: User[] }> {
    const response = await api.get('/users/search', { 
      params: { q: query, limit: 20 } 
    });
    return response.data;
  },

  async getUserById(id: number): Promise<{ user: User }> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
};
