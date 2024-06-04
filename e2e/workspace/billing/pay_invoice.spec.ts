import { type Page, test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import BillingPage from '../../../pages/billing.page';
const statePath = TestData.STATE.STORAGE_STATE;

test.describe('invoice creating and payment validation', async () => {
    test('verify invoice details and payment process', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const billingPage = new BillingPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);

        const newPage: Page = await context.newPage();
        const api = new ApiPage(newPage);
        const usageData = await api.getServicesData();

        const usageParams = { sku: usageData.sku, expectedPrice: 1, isBillable: true, quantity: 15 };
        await loginPage.login(TestData.USER.TEST_USER_4);
        await context.storageState({ path: statePath });

        const usageDetails = await apiPage.createUsage(usageParams, usageData.service.apiKey, statePath);
        await billingPage.clickElement(billingPage.headerBillingIcon);
        await billingPage.clickElement(billingPage.historyTab);
        await page.waitForTimeout(4000);
        const invoiceNumber = await billingPage.checkInvoiceDetailsInTable(usageDetails.data.price, 'Unpaid');
        await billingPage.clickElement(billingPage.firstInvoiceViewIcon);
        await billingPage.checkSingleInvoiceDetails(invoiceNumber, 'Unpaid');
        await billingPage.payInvoice();
        await billingPage.checkInvoiceDetailsInTable(usageDetails.data.price, 'Paid');
        await billingPage.checkNotifications(`New invoice created ${invoiceNumber}`);
        await page.reload();
        await billingPage.clickElement(billingPage.firstInvoiceViewIcon);
        await billingPage.checkSingleInvoiceDetails(invoiceNumber, 'Paid');
        await billingPage.elementNotDisplayed(billingPage.payInvoiceBtn);
    });
});
