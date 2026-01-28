import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';
import path from 'path';

export class LoginPage extends BasePage {
  private emailInput = this.page.locator('#email');
  private passwordInput = this.page.locator('#password');
  private loginButton = this.page.locator('button[type="submit"]');

  private title = this.page.locator('#title');
  private description = this.page.locator('#description');
  private status = this.page.locator('#status').selectOption({ label: 'Pending' });
  private createButton = this.page.locator('button[type="submit"]');

  private readonly filePath = `file://${path.resolve(__dirname, '../../../ui/index.html')}`;

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.filePath);
    await this.waitForLoad();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email); 
    await this.fillField(this.passwordInput, password);
    await this.clickAndWait(this.loginButton);
  }

  async createTask(title: string, description: string): Promise<void> {
    await this.fillField(this.title, title); 
    await this.fillField(this.description, description);
    await this.status;
    await this.clickAndWait(this.createButton);
  }

  async expectLoginSuccessful(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard\.html/);
  }
}