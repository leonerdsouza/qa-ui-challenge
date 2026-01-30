import sqlite3 from 'sqlite3';
import { config } from '../config/config';
import { Task, User, Feedback } from '../types';

export class DBClient {
  private db: sqlite3.Database | null = null;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.db.path, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.runGet<User>('SELECT * FROM users WHERE id = ?', [id]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.runGet<User>('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getAllUsers(): Promise<User[]> {
    return this.runQuery<User>('SELECT * FROM users ORDER BY id');
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.runGet<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.runQuery<Task>(`
      SELECT 
        t.*,
        u.email as user_email,
        u.full_name as user_name
      FROM tasks t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC
    `);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return this.runQuery<Task>('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC', [userId]);
  }

  async createTask(task: Partial<Task>): Promise<{ lastID: number }> {
    const result = await this.runExec(
      `INSERT INTO tasks (user_id, title, description, status) 
       VALUES (?, ?, ?, ?)`,
      [
        task.user_id || 1,
        task.title || '',
        task.description || '',
        task.status || 'pending'
      ]
    );
    return { lastID: result.lastID || 0 };
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.user_id !== undefined) {
      fields.push('user_id = ?');
      values.push(updates.user_id);
    }

    if (fields.length === 0) return;

    values.push(id);
    await this.runExec(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteTask(id: number): Promise<void> {
    await this.runExec('DELETE FROM tasks WHERE id = ?', [id]);
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return this.runQuery<Feedback>(`
      SELECT f.*, u.email as user_email, u.full_name as user_name
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.id DESC
    `);
  }

  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    return this.runQuery<Feedback>('SELECT * FROM feedback WHERE user_id = ?', [userId]);
  }

  private async runQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.all(sql, params, (err: Error | null, rows: T[]) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  private async runGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.get(sql, params, (err: Error | null, row: T) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  private async runExec(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.run(sql, params, function(err: Error | null) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}