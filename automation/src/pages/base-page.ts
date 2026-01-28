import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  protected async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  protected async clickAndWait(locator: Locator): Promise<void> {
    await locator.click();
    await this.waitForLoad();
  }

  protected async fillField(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }
}