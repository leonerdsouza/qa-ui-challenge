import { test, expect } from '@playwright/test';
import { DBClient } from '../database/db-client';
import { ApiClient } from '../api/api-client';
import { TasksAPI } from '../api/tasks-api';
import path from 'path';



test.describe('Validation Tests', () => {
  let dbClient: DBClient;
  let apiClient: ApiClient;
  let tasksAPI: TasksAPI;

  const filePath = `file://${path.resolve(__dirname, '../../../ui/index.html')}`;

  test.beforeAll(async () => {
    dbClient = new DBClient();
    await dbClient.connect();
  });

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, 'http://localhost:3000');
    tasksAPI = new TasksAPI(apiClient);
  });

 //test.afterAll(async () => {
 //  await dbClient.disconnect();
 //});


  test('Test 1: Validate task creation - DB - API', async () => {
    const timestamp = Date.now();
    const testUserId = 1;
    
    const newTask = {
      user_id: testUserId,
      title: `Test Task ${timestamp}`,
      description: 'Created by validation test',
      status: 'pending' as const
    };

    const createResponse = await tasksAPI.createTask(newTask);
    expect(createResponse.id).toBeDefined();
    
    const taskId = createResponse.id;

    const dbTask = await dbClient.getTaskById(taskId);
    expect(dbTask).toBeDefined();
    expect(dbTask?.title).toBe(newTask.title);
    expect(dbTask?.status).toBe(newTask.status);
    expect(dbTask?.user_id).toBe(newTask.user_id);

    const apiUserTasks = await tasksAPI.getTasksByUserId(testUserId);
    const apiTask = apiUserTasks.find(t => t.id === taskId);
    
    if (apiTask) {
      expect(apiTask.title).toBe(newTask.title);
      expect(apiTask.user_id).toBe(newTask.user_id);
    }

    await tasksAPI.deleteTask(taskId);
  });

  test('Test 2: Validate task update - DB - API', async () => {
    const timestamp = Date.now();
    const testUserId = 1;
    
    const newTask = {
      user_id: testUserId,
      title: `Update Test ${timestamp}`,
      description: 'To be updated',
      status: 'pending' as const
    };

    const createResponse = await tasksAPI.createTask(newTask);
    const taskId = createResponse.id;
    
    if (!taskId) return;

    await new Promise(resolve => setTimeout(resolve, 500));

    const updates = {
      title: 'Updated Title',
      description: 'Updated description',
      status: 'completed' as const
    };

    const updateResponse = await tasksAPI.updateTask(taskId, updates);
    expect(updateResponse.updated).toBe(1);

    await new Promise(resolve => setTimeout(resolve, 500));

    const dbTask = await dbClient.getTaskById(taskId);
    expect(dbTask?.title).toBe(updates.title);
    expect(dbTask?.status).toBe(updates.status);

    await tasksAPI.deleteTask(taskId);
  });

  test('Test 3: Validate task creation', async () => {

    const timestamp = Date.now();
    const testUserId = 1;
    
    const newTask = {
      user_id: testUserId,
      title: `Test Task ${timestamp}`,
      description: 'Created by validation test',
      status: 'pending' as const
    };

    const createResponse = await tasksAPI.createTask(newTask);
    expect(createResponse.id).toBeDefined();
    
    const taskId = createResponse.id;

    const dbTask = await dbClient.getTaskById(taskId);
    expect(dbTask).toBeDefined();
    expect(dbTask?.title).toBe(newTask.title);
    expect(dbTask?.status).toBe(newTask.status);
    expect(dbTask?.user_id).toBe(newTask.user_id);

    const apiUserTasks = await tasksAPI.getTasksByUserId(testUserId);
    const apiTask = apiUserTasks.find(t => t.id === taskId);
    
    if (apiTask) {
      expect(apiTask.title).toBe(newTask.title);
      expect(apiTask.user_id).toBe(newTask.user_id);
    }
  });

  test('Test 4: Validate task creation - UI with DB validation', async ({ page }) => {

    await page.goto(filePath);
    await expect(page).toHaveTitle(/Login/);
    
    await page.locator('#email').fill('alice@mail.com');
    await page.locator('#password').fill('alice123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/.*dashboard|.*index/);

    const allTasksBefore = await dbClient.getAllTasks();
    const initialTaskCount = allTasksBefore.length;

    const timestamp = Date.now();
    const taskTitle = `UI_Task_${timestamp}`;
    const taskDescription = 'Created by UI test';
    
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.locator('#title').fill(taskTitle);
    await page.locator('#description').fill(taskDescription);
    await page.locator('#status').selectOption({ label: 'Pending' });
    await page.locator('button[type="submit"]').click();

    const allTasksAfter = await dbClient.getAllTasks();
    
    expect(allTasksAfter.length).toBe(initialTaskCount + 1);
    
    const newTask = allTasksAfter.find(t => t.title === taskTitle);
    expect(newTask).toBeDefined();
    expect(newTask?.description).toBe(taskDescription);
    expect(newTask?.status).toBe('pending');
    
    if (newTask && newTask.id) {
      await dbClient.deleteTask(newTask.id);
    }
  });


});