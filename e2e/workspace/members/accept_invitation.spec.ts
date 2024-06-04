import { test } from '@playwright/test';

import type { Page } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';
const statePath = TestData.STATE.STORAGE_STATE;

test.describe('workspace members invitations accepting', async () => {
    test('verify user invitation acceptance and display in members "Active" tab', async ({ context, page }) => {
        const membersPage = new MembersPage(page);
        const apiPage = new ApiPage(page);
        const loginPage = new LoginPage(page);
        const invitedMemberEmail = TestData.USER.VALID_EMAIL_EXAMPLE;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_2);
        await context.storageState({ path: statePath });
        await page.goto('/settings/members');
        const role = await apiPage.inviteMemberByApi(invitedMemberEmail, statePath);
        await membersPage.searchInvitedMember(invitedMemberEmail);
        const inviteLink = await membersPage.copyInvitationLink();

        const newPage: Page = await context.newPage();
        const loginPageForNewPage = new LoginPage(newPage);
        await newPage.goto(inviteLink);
        await loginPageForNewPage.acceptInvitation();
        await newPage.close();

        await membersPage.clickElement(membersPage.activeTab);
        await membersPage.userAddedToMembersList(invitedMemberEmail, role);
        await membersPage.checkMemberInfo(invitedMemberEmail, role);
        await membersPage.deleteMemberByUI(invitedMemberEmail);
        // Todo: open after adding 'No results to display'
        // await membersPage.checkUserIsDeleted(invitedMemberEmail);
    });
});
