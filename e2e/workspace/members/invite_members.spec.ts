import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';
test.describe('workspace members invitation', async () => {
    test('should invite user and verify appearance in "Invited" tab', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const membersPage = new MembersPage(page);
        const invitedMember = TestData.USER.VALID_EMAIL_EXAMPLE;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_4);
        await loginPage.goToWorkspaceSection('Members');
        await membersPage.buttonIsEnabled(membersPage.inviteMemberBtn);
        await membersPage.clickElement(membersPage.inviteMemberBtn);
        await membersPage.checkModalIsOpened('Invite Member');
        await membersPage.buttonIsDisabled(membersPage.sendInviteBtn);
        const selectedRole = await membersPage.fillAndValidateInviteModal(invitedMember);
        await membersPage.clickElement(membersPage.sendInviteBtn);
        await membersPage.checkAlertMessage(TestData.MESSAGES.INVITE_SENT);
        await membersPage.clickElement(membersPage.invitationTab);
        await membersPage.tabIsActive(membersPage.invitationTab);
        await membersPage.memberIsShownInPendingList(invitedMember, selectedRole);
        await membersPage.clickElement(membersPage.revokeInvitedMember);
        await membersPage.clickElement(membersPage.revokeInvitation);
    });
});
