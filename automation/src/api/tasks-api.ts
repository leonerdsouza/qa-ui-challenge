import { ApiClient } from './api-client';
import { Task } from '../types';

export class TasksAPI {
  constructor(private apiClient: ApiClient) {}

  async getTaskById(id: number): Promise<Task | null> {
    try {
      const users = await this.apiClient.get<any[]>('/users');
      
      if (!Array.isArray(users)) {
        return null;
      }
      
      for (const user of users) {
        try {
          const userTasks = await this.apiClient.get<any[]>(`/tasks/${user.id}`);
          if (Array.isArray(userTasks)) {
            const task = userTasks.find(t => t.id === id);
            if (task) return task as Task;
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    try {
      const response = await this.apiClient.get<any>(`/tasks/${userId}`);
      
      if (Array.isArray(response)) {
        return response as Task[];
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  async createTask(taskData: {
    user_id: number;
    title: string;
    description?: string;
    status?: 'pending' | 'completed';
  }): Promise<{ id: number }> {
    const response = await this.apiClient.post<any>('/tasks', {
      user_id: taskData.user_id,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending'
    });
    
    return response as { id: number };
  }

  async updateTask(id: number, updates: {
    title?: string;
    description?: string;
    status?: 'pending' | 'completed';
  }): Promise<{ updated: number }> {
    const response = await this.apiClient.put<any>(`/tasks/${id}`, updates);
    const result = response as any;
    return {
      updated: result.updated || result.changes || 0
    };
  }

  async deleteTask(id: number): Promise<{ deleted: number }> {
    const response = await this.apiClient.delete<any>(`/tasks/${id}`);
    const result = response as any;
    return {
      deleted: result.deleted || result.changes || 0
    };
  }
}