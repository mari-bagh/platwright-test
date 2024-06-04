import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';
const statePath = TestData.STATE.STORAGE_STATE;
const roleName = TestData.WORKSPACE.RANDOM_ROLE_NAME;
const invitedMemberEmail = TestData.USER.VALID_EMAIL_EXAMPLE;
let role_id: string;
test.describe.skip('"manage space" permissions enablement', async () => {
    test(`verify "Add space" button's presence for users with permission`, async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const membersPage = new MembersPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_1);
        await context.storageState({ path: statePath });
        role_id = await apiPage.createRoleByApi(roleName, statePath, ['portal:spaces:manage']);
        await apiPage.inviteMemberByApi(invitedMemberEmail, statePath, null, role_id);
        await page.goto('/settings/members');
        await membersPage.clickElement(membersPage.invitationTab);
        await membersPage.searchInvitedMember(invitedMemberEmail);
        const inviteLink = await membersPage.copyInvitationLink();

        const newPage: Page = await context.newPage();
        await newPage.goto(inviteLink);
        const loginPageForNewPage = new LoginPage(newPage);
        await loginPageForNewPage.acceptInvitation();

        const addSpace = newPage.locator('[data-testid="AddIcon"]');
        await expect(addSpace).toBeVisible();
    });
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
