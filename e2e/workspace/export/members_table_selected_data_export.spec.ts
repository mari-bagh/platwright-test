import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';

test.describe('workspace members table export for selected rows', async () => {
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
        await loginPage.login(TestData.USER.TEST_USER);
        await page.goto('/settings/members');
        await loginPage.clickElement(loginPage.firstRowCheckbox);
        await membersPage.clickElement(membersPage.exportMembersTable);
        await membersPage.elementDisplayed(membersPage.exportModal);
    });
    test('verify user can export members table selected data via xlsx ', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const formattedTableData = await loginPage.parseTableData(options, 0);
        await loginPage.fillExportDataModal('Members', 'Selected Rows', 'exel');
        await loginPage.compareExportedDataAndTableData(formattedTableData, 'xlsx');
    });
    test('verify user can export members table selected data via csv ', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const formattedTableData = await loginPage.parseTableData(options, 0);
        await loginPage.fillExportDataModal('Members', 'Selected Rows', 'csv');
        await loginPage.compareExportedDataAndTableData(formattedTableData, 'csv');
    });
});
