import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import ServicePage from '../../../pages/services.page';

test.describe('workspace requests table export for filtered data', async () => {
    const options = {
        'Service Type': 2,
        Issued: 3,
        Status: 4,
        Name: 1
    };
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        const servicePage = new ServicePage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_4);
        await servicePage.clickElement(servicePage.filterButton);
        await servicePage.openFilterCategory('Status Categories', 'success');
        await servicePage.clickElement(servicePage.applyFilters);
        await page.waitForTimeout(5000);
        await servicePage.clickElement(servicePage.exportRequestsTable);
        await servicePage.elementDisplayed(servicePage.exportModal);
    });
    test('verify user can export requests table filtered data via xlsx ', async ({ page }) => {
        const servicePage = new ServicePage(page);
        const formattedTableData = await servicePage.parseTableData(options);
        await servicePage.fillExportDataModal('Requests', 'Filtered Rows', 'exel');
        await servicePage.compareExportedDataAndTableData(formattedTableData, 'xlsx');
    });
    test('verify user can export requests table filtered data via csv ', async ({ page }) => {
        const servicePage = new ServicePage(page);
        const formattedTableData = await servicePage.parseTableData(options);
        await servicePage.fillExportDataModal('Requests', 'Filtered Rows', 'csv');
        await servicePage.compareExportedDataAndTableData(formattedTableData, 'csv');
    });
});
