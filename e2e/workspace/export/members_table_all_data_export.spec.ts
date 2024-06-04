import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';

test.describe('workspace members table export for all data', async () => {
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
        await membersPage.clickElement(membersPage.exportMembersTable);
        await membersPage.elementDisplayed(membersPage.exportModal);
    });
    test('verify user can export members table all data via xlsx ', async ({ page }) => {
        const membersPage = new MembersPage(page);
        const formattedTableData = await membersPage.parseTableData(options);
        await membersPage.fillExportDataModal('Members', 'All data', 'exel');
        await membersPage.compareExportedDataAndTableData(formattedTableData, 'xlsx');
    });
    test('verify user can export members table all data via csv ', async ({ page }) => {
        const membersPage = new MembersPage(page);
        const formattedTableData = await membersPage.parseTableData(options);
        await membersPage.fillExportDataModal('Members', 'All data', 'csv');
        await membersPage.compareExportedDataAndTableData(formattedTableData, 'csv');
    });
});
