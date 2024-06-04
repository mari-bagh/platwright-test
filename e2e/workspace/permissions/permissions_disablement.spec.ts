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

test.describe('permissions disablement', async () => {
    test(`validate manage features absence for users without permissions`, async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const membersPage = new MembersPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_4);
        await context.storageState({ path: statePath });
        role_id = await apiPage.createRoleByApi(roleName, statePath);
        await apiPage.inviteMemberByApi(invitedMemberEmail, statePath, null, role_id);
        await page.goto('/settings/members');
        await membersPage.searchInvitedMember(invitedMemberEmail);
        const inviteLink = await membersPage.copyInvitationLink();

        const newPage: Page = await context.newPage();
        await newPage.goto(inviteLink);
        const loginPageForNewPage = new LoginPage(newPage);
        await loginPageForNewPage.acceptInvitation();

        await newPage.goto('/settings/members');
        await newPage.waitForTimeout(5000);
        const inviteBtn = newPage.locator('[data-testid="invite-member-button"]');
        await expect(inviteBtn).not.toBeVisible();
        const manageActions = newPage.locator('[data-testid="edit-icon"]');
        await expect(manageActions).not.toBeVisible();

        await loginPageForNewPage.clickElementByText('Roles');
        await newPage.waitForLoadState();
        const manageRoleActions = newPage.locator('[data-testid="edit-icon"]');
        await expect(manageRoleActions).not.toBeVisible();

        await loginPageForNewPage.clickElementByText('Services');
        await newPage.waitForLoadState();
        const serviceToggle = newPage.locator('[type="checkbox"]').nth(0);
        expect(serviceToggle).not.toBe('clickable');

        await newPage.goto('/billing');
        await newPage.waitForLoadState();
        await newPage.waitForTimeout(5000);
        const managePayment = newPage.locator('[data-testid="AddIcon"]');
        await expect(managePayment).not.toBeVisible();
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
