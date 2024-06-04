import { expect, test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import RolePage from '../../../pages/roles.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
const statePath = TestData.STATE.STORAGE_STATE;
let role_id: string;

test.describe('role permissions ui validation', async () => {
    test('should save and display selected permissions for a new role', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const rolePage = new RolePage(page);
        const roleName = TestData.WORKSPACE.RANDOM_ROLE_NAME;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_2);
        await context.storageState({ path: statePath });

        await page.goto('/settings/roles');
        await rolePage.clickElement(rolePage.createRoleButton);
        await rolePage.fillInInput(rolePage.roleNameInput, roleName);
        await rolePage.clickElement(rolePage.permissionsTab);
        await rolePage.tabIsActive(rolePage.permissionsTab);
        await rolePage.selectRolePermissions();
        role_id = await rolePage.saveRole();
        await rolePage.goToRoleDetails(roleName);
        await rolePage.clickElement(rolePage.permissionsTab);
        await rolePage.clickElement(rolePage.portalPermission);
        await expect(rolePage.permissionToggle).toBeChecked();
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
