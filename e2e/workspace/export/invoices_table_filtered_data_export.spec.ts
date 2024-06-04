import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import BillingPage from '../../../pages/billing.page';

test.describe('workspace invoice table export for filtered rows', async () => {
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
        await loginPage.login(TestData.USER.TEST_USER_1);
        await page.goto('/billing/history');
        await billingPage.clickElement(billingPage.filterButton);
        await billingPage.openFilterCategory('Status', 'paid');
        await billingPage.clickElement(billingPage.applyFilters);
        await page.waitForTimeout(4000);
        await billingPage.clickElement(billingPage.exportInvoicesBtn);
        await billingPage.elementDisplayed(billingPage.exportModal);
    });
    test('verify user can export invoice table filtered data via xlsx ', async ({ page }) => {
        const billingPage = new BillingPage(page);
        const formattedTableData = await billingPage.parseTableData(options);
        await billingPage.fillExportDataModal('Invoices', 'Filtered rows', 'exel');
        await billingPage.compareExportedDataAndTableData(formattedTableData, 'xlsx');
    });
    test('verify user can export invoice table filtered data via csv ', async ({ page }) => {
        const billingPage = new BillingPage(page);
        const formattedTableData = await billingPage.parseTableData(options);
        await billingPage.fillExportDataModal('Invoices', 'Filtered rows', 'csv');
        await billingPage.compareExportedDataAndTableData(formattedTableData, 'csv');
    });
});
