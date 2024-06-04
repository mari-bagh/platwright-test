import { expect } from '@playwright/test';

import type { Page } from '@playwright/test';

import BasePage from './base.page';
import TestData from '../helpers/test.data';

export default class LoginPage extends BasePage {
    constructor(
        page: Page,
        readonly usernameField = page.locator('#username'),
        readonly passwordField = page.locator('#password'),
        readonly continueLoginBtn = page.getByRole('button', { name: 'Continue', exact: true }),
        readonly continuePassBtn = page.locator('[type="submit"]:text("Continue")').last(),
        readonly loginIcon = page.locator('[data-testid="LoginIcon"]'),
        readonly emailField = page.locator('#email'),
        readonly googleBtn = page.locator('[type="submit"][data-provider="google"]'),
        readonly googleEmail = page.locator('[type="email"]'),
        readonly googlePassword = page.locator('[type="password"]'),
        readonly logoutBtn = page.locator('[class*="MuiAvatar-root"]'),
        readonly logoutIcon = page.locator('[data-testid="LogoutIcon"]')
    ) {
        super(page);
    }
    async register(username: string): Promise<string> {
        await super.clickElementByText('Sign up');
        await super.fillInInput(this.emailField, username);
        await super.clickElement(this.continueLoginBtn);
        await super.fillInInput(this.passwordField, TestData.USER.VALID_PASSWORD);
        await super.clickElement(this.continuePassBtn);
        const element = this.page.locator(`[type="submit"]:text("Accept")`);
        if (await element.isVisible()) {
            await super.clickElementByText('Accept');
        }
        const userInfo = await this.getUserId();
        return userInfo.sub;
    }
    async acceptInvitation(): Promise<string> {
        await super.fillInInput(this.passwordField, TestData.USER.VALID_PASSWORD);
        await super.clickElement(this.continuePassBtn);
        const element = this.page.locator(`[type="submit"]:text("Accept")`);
        if (await element.isVisible()) {
            await super.clickElementByText('Accept');
        }
        const userInfo = await this.getUserId();
        const homeIcon = this.page.locator('[data-testid="dashboard-home-icon"]');
        await expect(homeIcon).toBeVisible();
        return userInfo.sub;
    }
    async login(username: string): Promise<void> {
        await super.fillInInput(this.usernameField, username);
        await super.clickElement(this.continueLoginBtn);
        await super.fillInInput(this.passwordField, TestData.USER.VALID_PASSWORD);
        await super.clickElement(this.continuePassBtn);
    }
    async errorMessageIsDisplayed(arg: string, message: string): Promise<void> {
        const element = this.page.locator(`[id="error-element-${arg}"]`);
        await expect(element).toHaveText(message);
    }
    async logout(): Promise<void> {
        await super.clickElement(this.logoutBtn);
        await super.clickElement(this.logoutIcon);
    }
}
