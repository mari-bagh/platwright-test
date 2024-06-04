import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';

test.describe('workspace members table export for filtered rows', async () => {
    const options = {
        'Date Added': 3,
        Email: 2,
        Name: 1,
        Role: 5
    };
    test.beforeEach(async ({ page }) => {
        const membersPage = new MembersPage(page);
        const loginPage = new LoginPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_3);
        await page.goto('/settings/members');
        await membersPage.clickElement(membersPage.filterButton);
        await membersPage.sortFromFilter('email', 'DESC');
        await membersPage.clickElement(membersPage.applyFilters);
        await page.waitForTimeout(5000);
        await membersPage.clickElement(membersPage.exportMembersTable);
        await membersPage.elementDisplayed(membersPage.exportModal);
    });
    test('verify user can export members table filtered data via xlsx ', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const formattedTableData = await loginPage.parseTableData(options);
        await loginPage.fillExportDataModal('Members', 'Filtered Rows', 'exel');
        await loginPage.compareExportedDataAndTableData(formattedTableData, 'xlsx');
    });
    test('verify user can export members table filtered data via csv ', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const formattedTableData = await loginPage.parseTableData(options);
        await loginPage.fillExportDataModal('Members', 'Filtered Rows', 'csv');
        await loginPage.compareExportedDataAndTableData(formattedTableData, 'csv');
    });
});
