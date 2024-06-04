import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import SpacePage from '../../../pages/space.page';
import ServicesPage from '../../../pages/services.page';

const statePath = TestData.STATE.STORAGE_STATE;
const spaceName = TestData.WORKSPACE.RANDOM_SPACE_NAME;
let userId: string;
test.describe.skip('subspace service validation', async () => {
    test('verify service enablement/disablement functionality across subspaces from parent space', async ({
        context,
        page
    }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const servicePage = new ServicesPage(page);
        const spacePage = new SpacePage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        userId = await loginPage.register(TestData.USER.VALID_EMAIL_EXAMPLE);
        await context.storageState({ path: statePath });
        await apiPage.createWorkspace(TestData.WORKSPACE.RANDOM_WORKSPACE_NAME, statePath);

        const spaceInfo = await apiPage.createSpaceByApi(spaceName, statePath, true);
        const subSpaceSlug = await apiPage.createSubspaceByApi('subspace', spaceInfo.spaceId, statePath);

        await page.goto('/settings/services');
        await page.waitForLoadState('domcontentloaded');
        const selectedService = await servicePage.selectRandomService();
        await servicePage.clickElement(servicePage.confirmService);
        await servicePage.clickElement(loginPage.backButton);
        await spacePage.goToSpaceSections(spaceName, 'Services');
        await servicePage.checkServiceIsEnabledForSpace(selectedService);

        await servicePage.turnOnOffServiceForSubspacesFromSpace(
            TestData.MESSAGES.SUBSPACE_SERVICE_ENABLEMENT(selectedService)
        );
        await page.goto(`/space/${subSpaceSlug}/services`);
        await servicePage.checkServiceEnabledOrDisabledForSubspace(selectedService, true);

        await page.goto(`/space/${spaceInfo.spaceSlug}/services`);
        await servicePage.turnOnOffServiceForSubspacesFromSpace(
            TestData.MESSAGES.SUBSPACE_SERVICE_DISABLEMENT(selectedService)
        );
        await page.goto(`/space/${subSpaceSlug}/services`);
        await servicePage.checkServiceEnabledOrDisabledForSubspace(selectedService, false);
    });

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
