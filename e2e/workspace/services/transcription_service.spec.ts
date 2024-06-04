import { expect, test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import ServicesPage from '../../../pages/services.page';
const statePath = TestData.STATE.STORAGE_STATE;
let userId: string;
test.describe('transcription service', async () => {
    test('transcription service enablement-disablement', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const servicePage = new ServicesPage(page);
        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        userId = await loginPage.register(TestData.USER.VALID_EMAIL_EXAMPLE);
        await context.storageState({ path: statePath });
        await apiPage.createWorkspace(TestData.WORKSPACE.RANDOM_WORKSPACE_NAME, statePath);
        await servicePage.checkTranscriptionService(true);
        await servicePage.clickElement(servicePage.transcriptionService);
        const newPage = await context.waitForEvent('page');
        await newPage.waitForLoadState('domcontentloaded');
        const actualURL = newPage.url();
        const expectedURL = `${process.env.NEXT_PUBLIC_TRANSCRIPTION_URL}/new-request`;
        expect(actualURL).toEqual(expectedURL);

        await servicePage.goToWorkspaceSection('Services');
        await page.waitForTimeout(2000);
        await servicePage.enableDisableService('Transcription & Caption');
        await page.waitForTimeout(2000);
        await servicePage.clickElement(loginPage.backButton);
        await servicePage.checkTranscriptionService(false);

        await page.goto('/settings/services');
        await servicePage.enableDisableService('Transcription & Caption');
        await page.waitForTimeout(2000);
        await servicePage.clickElement(loginPage.backButton);
        await servicePage.checkTranscriptionService(true);
    });
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
