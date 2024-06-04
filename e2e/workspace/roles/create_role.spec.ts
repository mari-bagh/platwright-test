import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import RolePage from '../../../pages/roles.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
const statePath = TestData.STATE.STORAGE_STATE;
let role_id: string;

test.describe('role creation and validation in workspace', async () => {
    test('should successfully create a new role in workspace', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const rolePage = new RolePage(page);
        const roleName = TestData.WORKSPACE.RANDOM_ROLE_NAME;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_1);
        await context.storageState({ path: statePath });

        await rolePage.goToWorkspaceSection('Roles');
        await rolePage.clickElement(rolePage.createRoleButton);
        await rolePage.checkModalIsOpened('Add Role');
        await rolePage.tabIsActive(rolePage.detailsTab);
        await rolePage.clickElement(rolePage.saveRoleButton);
        await rolePage.elementHaveText(rolePage.roleNameMessage, TestData.MESSAGES.REQUIRED_FIELD);
        await rolePage.fillRoleDetails(roleName);
        role_id = await rolePage.saveRole();
        await rolePage.roleDisplayInTable(roleName);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
