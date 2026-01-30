import { test, expect } from '@playwright/test';
import { DBClient } from '../database/db-client';
import { ApiClient } from '../api/api-client';
import { TasksAPI } from '../api/tasks-api';
import { LoginPage } from '../pages/login-page';



test.describe('Validation Tests', () => {
  let dbClient: DBClient;
  let apiClient: ApiClient;
  let tasksAPI: TasksAPI;

  

  test.beforeAll(async () => {
    dbClient = new DBClient();
    await dbClient.connect();
  });

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request, 'http://localhost:3000');
    tasksAPI = new TasksAPI(apiClient);
  });

  test.afterAll(async () => {
    await dbClient.disconnect();
  });


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


  test('Test 3: Validate task creation - UI with DB validation', async ({ page }) => {
   const loginPage = new LoginPage(page);
   let createdTaskId: number | null = null;
   
   try {
     await loginPage.navigate();
     await loginPage.login('alice@mail.com', 'alice123');
     await loginPage.expectLoginSuccessful();
     
     const allTasksBefore = await dbClient.getAllTasks();
     const initialTaskCount = allTasksBefore.length;
     
     const timestamp = Date.now();
     const taskTitle = `UI_Task_${timestamp}`;
     const taskDescription = 'Created by UI test';
     
     const createButton = page.getByRole('button', { name: 'Create Task' });
     await expect(createButton).toBeVisible({ timeout: 5000 });
     await createButton.click();
     
     await page.waitForTimeout(1000);

    await loginPage.createTask(taskTitle,taskDescription);    
     
     let dbTaskFound = false;
     let newTask = null;
     
     for (let attempt = 1; attempt <= 10; attempt++) {
       await page.waitForTimeout(1000);
       const allTasksAfter = await dbClient.getAllTasks();
       const currentCount = allTasksAfter.length;
       
       newTask = allTasksAfter.find(t => 
         t.title === taskTitle || 
         t.description === taskDescription
       );
       
       if (newTask) {
         dbTaskFound = true;
         createdTaskId = newTask.id;
         
         expect(newTask.title).toBe(taskTitle);
         expect(newTask.description).toBe(taskDescription);
         expect(newTask.status).toBe('pending');
         expect(currentCount).toBe(initialTaskCount + 1);
         break;
       }
     }
     
     expect(dbTaskFound).toBe(true);
     expect(newTask).toBeDefined();
     
   } finally {
     if (createdTaskId) {
       try {
         await dbClient.deleteTask(createdTaskId);
         const deletedTask = await dbClient.getTaskById(createdTaskId);
         expect(deletedTask).toBeUndefined();
       } catch (cleanupError) {}
     }
     
     try {
       const finalTasks = await dbClient.getAllTasks();
       finalTasks.filter(t => 
         t.title.includes('UI_Task_') || 
         t.description?.includes('Created by UI test')
       );
     } catch (error) {}
   }
});

});