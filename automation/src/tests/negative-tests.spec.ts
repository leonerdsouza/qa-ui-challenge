import { test, expect } from '@playwright/test';
import { DBClient } from '../database/db-client';

test.describe('Negative Test Scenarios', () => {
  let dbClient: DBClient;

  test.beforeAll(async () => {
    dbClient = new DBClient();
    await dbClient.connect();
  });

  test.afterAll(async () => {
    await dbClient.disconnect();
  });

  test('Test invalid task creation scenarios', async ({ request }) => {
    const response1 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: 1, description: 'No title' }
    });
    
    const response2 = await request.post('http://localhost:3000/tasks', {
      data: { title: 'No user', description: 'No user_id' }
    });
    
    const response3 = await request.post('http://localhost:3000/tasks', {
      data: { description: 'No title or user_id' }
    });
    
    const response4 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: 'not-a-number', title: 'Test' }
    });
    
    const response5 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: 1, title: 12345 }
    });
    
    const response6 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: 1, title: 'Test', status: 'invalid' }
    });
    
    const response7 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: 1, title: '', description: 'Empty title' }
    });
    
    const response8 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: 999999, title: 'Test' }
    });
    
    const response9 = await request.post('http://localhost:3000/tasks', {
      data: { user_id: -1, title: 'Test' }
    });
    
    const allTasks = await dbClient.getAllTasks();
  });

  test('Test duplicate task creation', async ({ request }) => {
    const taskData = {
      user_id: 1,
      title: 'Duplicate Test Task',
      description: 'Testing duplicate prevention',
      status: 'pending'
    };
    
    const response1 = await request.post('http://localhost:3000/tasks', {
      data: taskData
    });
    const task1 = await response1.json();
    
    if (task1.id) {
      const response2 = await request.post('http://localhost:3000/tasks', {
        data: taskData
      });
      const task2 = await response2.json();
      
      if (task2.id) {
        await dbClient.getTaskById(task1.id);
        await dbClient.getTaskById(task2.id);
        
        await request.delete(`http://localhost:3000/tasks/${task1.id}`);
        await request.delete(`http://localhost:3000/tasks/${task2.id}`);
      } else {
        await request.delete(`http://localhost:3000/tasks/${task1.id}`);
      }
    }
  });
});