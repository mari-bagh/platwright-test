import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import RolePage from '../../../pages/roles.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';

const statePath = TestData.STATE.STORAGE_STATE;
const roleName = TestData.WORKSPACE.RANDOM_ROLE_NAME;
let role_id: string;

test.describe('add members to role', async () => {
    test('should successfully add a member to role from role modal', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const rolePage = new RolePage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_2);
        await context.storageState({ path: statePath });

        await page.goto('/settings/roles');
        await rolePage.clickElement(rolePage.createRoleButton);
        await rolePage.checkModalIsOpened('Add Role');
        await rolePage.fillRoleDetails(roleName);
        await rolePage.clickElement(rolePage.membersTab);
        await rolePage.tabIsActive(rolePage.membersTab);
        await page.waitForLoadState();
        await rolePage.clickElement(rolePage.addMembersButton);
        await rolePage.clickElement(rolePage.addMemberCheckbox);
        const addedMemberEmail = await rolePage.emailInList.innerText();
        await rolePage.buttonIsEnabled(rolePage.addMembersBtnInModal);
        await rolePage.clickElement(rolePage.addMembersBtnInModal);
        role_id = await rolePage.saveRole();
        await rolePage.checkMemberAddedToModal(roleName, `${addedMemberEmail}@testing.qa`);
        await page.goto('/settings/members');
        await rolePage.clickElement(rolePage.searchIcon);
        await rolePage.typeInInput(rolePage.searchInput, addedMemberEmail);
        await page.waitForTimeout(4000);
        await rolePage.checkMemberAddedToRole(roleName);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
