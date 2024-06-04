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
test.describe('permissions enablement', async () => {
    test(`validate manage features presence for users with permissions`, async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const membersPage = new MembersPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_3);
        await context.storageState({ path: statePath });
        role_id = await apiPage.createRoleByApi(roleName, statePath, [
            'portal:members:invite',
            'portal:members:manage',
            'portal:payment:manage',
            'portal:roles:manage',
            'portal:service:manage'
        ]);
        await apiPage.inviteMemberByApi(invitedMemberEmail, statePath, null, role_id);
        await page.goto('/settings/members');
        await membersPage.searchInvitedMember(invitedMemberEmail);
        const inviteLink = await membersPage.copyInvitationLink();

        const newPage: Page = await context.newPage();
        await newPage.goto(inviteLink);
        const loginPageForNewPage = new LoginPage(newPage);
        await loginPageForNewPage.acceptInvitation();

        await newPage.goto('/settings/members');
        await newPage.waitForLoadState('domcontentloaded');
        const inviteBtn = newPage.locator('[data-testid="invite-member-button"]');
        await expect(inviteBtn).toBeVisible();
        const manageActions = await newPage.$$('[data-testid="edit-icon"]');
        expect(manageActions).toBeTruthy();

        await loginPageForNewPage.clickElementByText('Roles');
        await newPage.waitForLoadState('domcontentloaded');
        const manageRoleActions = await newPage.$$('[data-testid="edit-icon"]');
        expect(manageRoleActions).toBeTruthy();

        await loginPageForNewPage.clickElementByText('Services');
        await newPage.waitForLoadState('domcontentloaded');
        const serviceToggle = newPage.locator('[type="checkbox"]').nth(0);
        const confirmEnablement = newPage.locator('button:has-text("Confirm")');
        await serviceToggle.click();
        await newPage.waitForLoadState('domcontentloaded');
        await expect(confirmEnablement).toBeVisible();
        await confirmEnablement.click();
        await newPage.waitForLoadState('domcontentloaded');
        await expect(serviceToggle).toBeChecked();

        await newPage.goto('/billing');
        await newPage.waitForLoadState('domcontentloaded');
        const managePayment = newPage.locator('[data-testid="AddIcon"]');
        await expect(managePayment).toBeVisible();
    });
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.delete('roles', role_id, statePath);
    });
});
