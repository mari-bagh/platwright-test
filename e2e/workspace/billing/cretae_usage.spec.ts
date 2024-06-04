import { type Page, test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import BillingPage from '../../../pages/billing.page';
const statePath = TestData.STATE.STORAGE_STATE;

test.describe('usage creating validation', async () => {
    test('verify that user can create a usage and verify the total price', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const billingPage = new BillingPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);

        const newPage: Page = await context.newPage();
        const api = new ApiPage(newPage);
        const usageData = await api.getServicesData();

        const usageParams = { sku: usageData.sku, expectedPrice: 1, isBillable: true, quantity: 5 };
        await loginPage.login(TestData.USER.TEST_USER_1);
        await context.storageState({ path: statePath });
        const requestInfo = await billingPage.checkUsageCurrentData();
        await apiPage.createUsage(usageParams, usageData.service.apiKey, statePath);
        await billingPage.checkUsageIsCreated(
            usageData.service.title,
            requestInfo.requestCount,
            usageData.perUnitPrice,
            usageParams.quantity,
            requestInfo.totalPrice
        );
    });
});
