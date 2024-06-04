import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import RolePage from '../../../pages/roles.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
const statePath = TestData.STATE.STORAGE_STATE;
let role_id: string;

test.describe('role edition', async () => {
    test('should edit and save created role details', async ({ context, page }) => {
        const rolePage = new RolePage(page);
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const roleName = TestData.WORKSPACE.RANDOM_ROLE_NAME;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_2);
        await context.storageState({ path: statePath });

        role_id = await apiPage.createRoleByApi(roleName, statePath);
        await page.goto('/settings/roles');
        await rolePage.goToRoleDetails(roleName);
        await rolePage.fillRoleDetails(`${roleName}-edited`);
        await rolePage.clickElement(rolePage.saveRoleButton);
        await rolePage.checkAlertMessage(TestData.MESSAGES.ROLE_EDITED);
        await rolePage.roleDisplayInTable(`${roleName}-edited`);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
