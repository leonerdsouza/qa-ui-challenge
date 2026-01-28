import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { Task } from '../types';

export class DashboardPage extends BasePage {
  private taskTable = this.page.locator('#tasks-table');
  private taskRows = this.taskTable.locator('tbody tr');
  private createTaskButton = this.page.locator('#create-task-button');
  private feedbackSection = this.page.locator('#feedback-section');
  private logoutButton = this.page.locator('#logout-button');

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/dashboard.html');
    await this.waitForLoad();
  }

  async getTaskRow(taskId: number): Promise<Locator> {
    return this.taskRows.filter({ has: this.page.locator(`[data-task-id="${taskId}"]`) });
  }

   async getTaskDetailsWithDefaults(taskId: number): Promise<{ title: string; description: string; status: string }> {
    const row = await this.getTaskRow(taskId);
    
    // Garantir que a linha existe
    await expect(row).toBeVisible();
    
    const title = (await row.locator('.task-title').textContent()) || '';
    const description = (await row.locator('.task-description').textContent()) || '';
    const status = (await row.locator('.task-status').textContent()) || 'pending';
    
    return {
      title,
      description,
      status,
    };
  }

  async getTaskDetails(taskId: number): Promise<Partial<Task>> {
    const row = await this.getTaskRow(taskId);
    
    const title = await row.locator('.task-title').textContent();
    const description = await row.locator('.task-description').textContent();
    const status = await row.locator('.task-status').textContent();
    
    return {
      title: title || undefined,
      description: description || undefined,
      status: (status || undefined) as 'pending' | 'in-progress' | 'completed' | undefined,
    };
  }

  async clickEditTask(taskId: number): Promise<void> {
    const row = await this.getTaskRow(taskId);
    await row.locator('.edit-button').click();
    await this.waitForLoad();
  }

  async clickDeleteTask(taskId: number): Promise<void> {
    const row = await this.getTaskRow(taskId);
    await row.locator('.delete-button').click();
    await this.waitForLoad();
  }

  async expectTaskCount(count: number): Promise<void> {
    await expect(this.taskRows).toHaveCount(count);
  }

  async expectTaskExists(taskId: number, shouldExist = true): Promise<void> {
    if (shouldExist) {
      await expect(await this.getTaskRow(taskId)).toBeVisible();
    } else {
      await expect(await this.getTaskRow(taskId)).not.toBeVisible();
    }
  }

  async createNewTask(): Promise<void> {
    await this.clickAndWait(this.createTaskButton);
  }
}