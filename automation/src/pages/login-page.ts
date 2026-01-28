import { Page, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class LoginPage extends BasePage {
  private emailInput = this.page.locator('#email');
  private passwordInput = this.page.locator('#password');
  private loginButton = this.page.locator('#submit');
  private errorMessage = this.page.locator('.error-message');
  private userSelect = this.page.locator('#user-select');

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.page.goto('/qa-ui-challenge/ui/index.html');
    await this.waitForLoad();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.clickAndWait(this.loginButton);
  }

  async selectUser(userId: number): Promise<void> {
    await this.userSelect.selectOption(userId.toString());
    await this.waitForLoad();
  }

  async expectErrorMessage(text: string): Promise<void> {
    await expect(this.errorMessage).toContainText(text);
  }

  async expectLoginSuccessful(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard\.html/);
  }
}