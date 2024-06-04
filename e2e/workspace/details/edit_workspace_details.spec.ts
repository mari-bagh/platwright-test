import { test } from '@playwright/test';

import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import SpacePage from '../../../pages/space.page';

test.describe('workspace details', async () => {
    test('should successfully edit workspace details', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const spacePage = new SpacePage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.TEST_USER);
        await spacePage.goToWorkspaceSection('Details');
        await spacePage.pickRandomColorAndCheck();
        const workspaceName = await spacePage.returnElementValue(spacePage.nameInput);
        await spacePage.fillInInput(spacePage.nameInput, 'edited ' + workspaceName);
        await spacePage.clickElement(spacePage.saveDetails);
        await spacePage.checkAlertMessage(TestData.MESSAGES.WORKSPACE_UPDATED);
        await spacePage.elementContainText(spacePage.nameInput, 'edited ' + workspaceName);
        await spacePage.fillInInput(spacePage.nameInput, workspaceName);
        await spacePage.clickElement(spacePage.saveDetails);
        await spacePage.checkAlertMessage(TestData.MESSAGES.WORKSPACE_UPDATED);
    });
});
