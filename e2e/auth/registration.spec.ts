import { test } from '@playwright/test';

import ApiPage from '../../pages/api.page';
import LoginPage from '../../pages/login.page';
import TestData from '../../helpers/test.data';
let userId: string;

test.describe.serial('registration flow', async () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
    });

    test('should register with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const userEmail = TestData.USER.VALID_EMAIL_EXAMPLE;
        userId = await loginPage.register(userEmail);
        await loginPage.elementNotDisplayed(loginPage.createAccount);
    });

    test('should not register with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.clickElementByText('Sign up');
        await loginPage.fillInInput(loginPage.emailField, TestData.USER.INVALID_EMAIL_FORMAT);
        await loginPage.clickElement(loginPage.continueLoginBtn);
        await loginPage.errorMessageIsDisplayed('email', TestData.MESSAGES.INVALID_EMAIL);
        await loginPage.fillInInput(loginPage.emailField, TestData.USER.VALID_EMAIL_EXAMPLE);
        await loginPage.clickElement(loginPage.continueLoginBtn);
        await loginPage.fillInInput(loginPage.passwordField, TestData.USER.INVALID_PASSWORD_FORMAT);
        await loginPage.clickElement(loginPage.continuePassBtn);
        // await loginPage.errorMessageIsDisplayed('password', TestData.MESSAGES.INVALID_PASSWORD);
    });
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
