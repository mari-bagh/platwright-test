import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import SpacePage from '../../../pages/space.page';
test.describe('upload workspace logo', async () => {
    test('should successfully upload and remove workspace logo', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const spacePage = new SpacePage(page);
        const apiPage = new ApiPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER);
        await page.goto('/settings/details');
        await spacePage.pickRandomColorAndCheck();
        await spacePage.uploadPhoto.setInputFiles('./tests/fixtures/workspace-logo.jpg');
        await spacePage.clickElement(spacePage.saveLogo);
        await apiPage.getResponseData('files/organizations');
        await spacePage.clickElement(spacePage.saveDetails);
        await apiPage.checkLogoUpload('organizations');
        await spacePage.checkAlertMessage(TestData.MESSAGES.WORKSPACE_UPDATED);
        await spacePage.clickElement(spacePage.removeIcon);
        await spacePage.clickElement(spacePage.confirmDelete);
        await spacePage.clickElement(spacePage.saveDetails);
        await apiPage.checkLogoUpload('organizations', false);
        await spacePage.checkAlertMessage(TestData.MESSAGES.WORKSPACE_UPDATED);
    });
});
