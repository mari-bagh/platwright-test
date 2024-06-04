import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import SpacePage from '../../../pages/space.page';
import ServicesPage from '../../../pages/services.page';
const statePath = TestData.STATE.STORAGE_STATE;
const spaceName = TestData.WORKSPACE.RANDOM_SPACE_NAME;
let userId: string;

test.describe.skip('service validation', async () => {
    test('verify service enabled for spaces after workspace enable', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const servicePage = new ServicesPage(page);
        const spacePage = new SpacePage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        userId = await loginPage.register(TestData.USER.VALID_EMAIL_EXAMPLE);
        await context.storageState({ path: statePath });
        await apiPage.createWorkspace(TestData.WORKSPACE.RANDOM_WORKSPACE_NAME, statePath);

        await apiPage.createSpaceByApi(spaceName, statePath);
        await page.goto('/settings/services');
        const selectedService = await servicePage.selectRandomService();
        await servicePage.clickElement(servicePage.confirmService);
        await servicePage.clickElement(loginPage.backButton);
        await spacePage.goToSpaceSections(spaceName, 'Services');
        await servicePage.checkServiceIsEnabledForSpace(selectedService);
        await servicePage.turnOnService();
        await servicePage.turnOffService();
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
