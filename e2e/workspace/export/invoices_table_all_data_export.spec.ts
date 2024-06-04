import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import BillingPage from '../../../pages/billing.page';

test.describe('workspace invoice table export for all data', async () => {
    const options = {
        'Payment Due': 3,
        Invoice: 1,
        Issued: 2,
        Amount: 4,
        Status: 5
    };
    test.beforeEach(async ({ page }) => {
        const billingPage = new BillingPage(page);
        const loginPage = new LoginPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_3);
        await page.goto('/billing/history');
        await billingPage.clickElement(billingPage.exportInvoicesBtn);
        await billingPage.elementDisplayed(billingPage.exportModal);
    });
    test('verify user can export invoice table all data via xlsx ', async ({ page }) => {
        const billingPage = new BillingPage(page);
        const formattedTableData = await billingPage.parseTableData(options);
        await billingPage.fillExportDataModal('Invoices', 'All data', 'exel');
        await billingPage.compareExportedDataAndTableData(formattedTableData, 'xlsx');
    });
    test('verify user can export invoice table all data via csv ', async ({ page }) => {
        const billingPage = new BillingPage(page);
        const formattedTableData = await billingPage.parseTableData(options);
        await billingPage.fillExportDataModal('Invoices', 'All data', 'csv');
        await billingPage.compareExportedDataAndTableData(formattedTableData, 'csv');
    });
});
