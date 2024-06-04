import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import RolePage from '../../../pages/roles.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
const statePath = TestData.STATE.STORAGE_STATE;

test.describe('role deletion', async () => {
    test('should successfully delete a role', async ({ context, page }) => {
        const rolePage = new RolePage(page);
        const loginPage = new LoginPage(page);
        const roleName = TestData.WORKSPACE.RANDOM_ROLE_NAME;
        const apiPage = new ApiPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_4);
        await context.storageState({ path: statePath });
        await apiPage.createRoleByApi(roleName, statePath);
        await page.goto('/settings/roles');
        await rolePage.deleteRoleByUI(roleName);
    });
});
