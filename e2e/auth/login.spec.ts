import { test } from '@playwright/test';

import LoginPage from '../../pages/login.page';
import TestData from '../../helpers/test.data';
test.describe('login verification', async () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
    });

    test('should login with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.login(TestData.USER.VALID_EMAIL);
    });

    test('should not login with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.fillInInput(loginPage.usernameField, TestData.USER.INVALID_EMAIL);
        await loginPage.clickElement(loginPage.continueLoginBtn);
        await loginPage.errorMessageIsDisplayed('username', TestData.MESSAGES.INVALID_EMAIL);
        await loginPage.fillInInput(loginPage.usernameField, TestData.USER.VALID_EMAIL);
        await loginPage.clickElement(loginPage.continueLoginBtn);
        await loginPage.fillInInput(loginPage.passwordField, TestData.USER.INVALID_PASSWORD);
        await loginPage.clickElement(loginPage.continuePassBtn);
        await loginPage.errorMessageIsDisplayed('password', TestData.MESSAGES.WRONG_EMAIL_OR_PASS);
    });

    test.skip('should login via google', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.clickElement(loginPage.googleBtn);
        await loginPage.fillInInput(loginPage.googleEmail, TestData.USER.GOOGLE_ACCOUNT);
        await loginPage.clickElementByText('Next');
        await loginPage.fillInInput(loginPage.googlePassword, TestData.USER.VALID_PASSWORD);
        await loginPage.clickElementByText('Next');
    });
});
