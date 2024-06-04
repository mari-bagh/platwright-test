import { type Page, test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import BillingPage from '../../../pages/billing.page';
const statePath = TestData.STATE.STORAGE_STATE;
let userId: string;

test.describe('invoice payment failure', async () => {
    test('verify that after paying an invoice with no balance, the payment status is correctly marked as "failed"', async ({
        context,
        page
    }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const billingPage = new BillingPage(page);
        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);

        const newPage: Page = await context.newPage();
        const api = new ApiPage(newPage);
        const usageData = await api.getServicesData();
        await newPage.close();

        const usageParams = { sku: usageData.sku, expectedPrice: 1, isBillable: true, quantity: 15 };
        userId = await loginPage.register(TestData.USER.VALID_EMAIL_EXAMPLE);
        await context.storageState({ path: statePath });
        await apiPage.createWorkspace(TestData.WORKSPACE.RANDOM_WORKSPACE_NAME, statePath);

        const usageDetails = await apiPage.createUsage(usageParams, usageData.service.apiKey, statePath);
        await billingPage.clickElement(billingPage.headerBillingIcon);
        await billingPage.clickElement(billingPage.historyTab);
        await page.waitForLoadState('domcontentloaded');
        const invoiceNumber = await billingPage.checkInvoiceDetailsInTable(usageDetails.data.price, 'Unpaid');
        await billingPage.clickElement(billingPage.firstInvoiceViewIcon);
        await billingPage.checkSingleInvoiceDetails(invoiceNumber, 'Unpaid');
        await billingPage.clickElement(billingPage.payInvoiceBtn);
        await billingPage.clickElement(billingPage.addPaymentMethodBtn);
        await billingPage.addPaymentMethod(TestData.WORKSPACE.CARD_WITHOUT_BALANCE);
        await billingPage.clickElement(billingPage.payBtn);
        await billingPage.elementDisplayed(billingPage.infoIcon);

        await page.goto('/billing/history');
        await page.waitForLoadState('domcontentloaded');
        await billingPage.checkInvoiceDetailsInTable(usageDetails.data.price, 'Failed');
        await page.reload();
        await billingPage.clickElement(billingPage.firstInvoiceViewIcon);
        await billingPage.checkSingleInvoiceDetails(invoiceNumber, 'Failed');
        await billingPage.buttonIsEnabled(billingPage.payInvoiceBtn);
    });
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
