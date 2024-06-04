import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';
const statePath = TestData.STATE.STORAGE_STATE;

test.describe('revoke workspace members invitation', async () => {
    test('verify that user can revoke the invitation from workspace', async ({ context, page }) => {
        const membersPage = new MembersPage(page);
        const apiPage = new ApiPage(page);
        const loginPage = new LoginPage(page);
        const invitedMemberEmail = TestData.USER.VALID_EMAIL_EXAMPLE;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_3);
        await context.storageState({ path: statePath });
        await page.goto('/settings/members');
        await apiPage.inviteMemberByApi(invitedMemberEmail, statePath);
        await membersPage.clickElement(membersPage.invitationTab, 20000);
        await membersPage.tabIsActive(membersPage.invitationTab);
        await membersPage.typeInInput(membersPage.invitedMemberSearch, invitedMemberEmail);
        await page.waitForLoadState();
        await page.waitForTimeout(2500);
        await membersPage.clickElement(membersPage.revokeInvitedMember);
        await membersPage.clickElement(membersPage.revokeInvitation);
        await membersPage.checkAlertMessage(TestData.MESSAGES.CANCEL_INVITATION);
        await page.waitForLoadState();
        await page.waitForTimeout(3500);
        await membersPage.elementContainText(membersPage.tableBody, 'No records to display');
    });
});
