import { test } from '@playwright/test';

import type { Page } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import MembersPage from '../../../pages/members.page';
const statePath = TestData.STATE.STORAGE_STATE;
let userId: string;

test.describe('workspace members invitations accepting via email', async () => {
    test('verify user invitation acceptance via email and display in members "Active" tab', async ({
        context,
        page
    }) => {
        const membersPage = new MembersPage(page);
        const apiPage = new ApiPage(page);
        const loginPage = new LoginPage(page);
        const invitedMemberEmail = TestData.USER.VALID_GUERRILLA_EMAIL_EXAMPLE;

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER_3);
        await context.storageState({ path: statePath });
        await page.goto('/settings/members');
        const role = await apiPage.inviteMemberByApi(invitedMemberEmail, statePath);

        const newPage: Page = await context.newPage();
        const inboxPage = new MembersPage(newPage);
        await inboxPage.getLinkFromGuerrila(invitedMemberEmail);
        const invitePage = await context.waitForEvent('page');
        await invitePage.waitForLoadState('domcontentloaded');
        const loginPageFOrInvitee = new LoginPage(invitePage);
        await loginPageFOrInvitee.acceptInvitation();

        await membersPage.userAddedToMembersList(invitedMemberEmail, role);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
