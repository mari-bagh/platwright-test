import { test } from '@playwright/test';

import ApiPage from '../../../pages/api.page';
import LoginPage from '../../../pages/login.page';
import TestData from '../../../helpers/test.data';
import BillingPage from '../../../pages/billing.page';
const statePath = TestData.STATE.STORAGE_STATE;
const userEmail = TestData.USER.VALID_EMAIL_EXAMPLE;
let userId: string;

test.describe.serial('card adding and updating validation', async () => {
    const ownerName = TestData.USER.VALID_EMAIL_EXAMPLE;
    const cardName = ownerName.split('@')[0];
    test('verify that user can successfully add a card to account', async ({ context, page }) => {
        const loginPage = new LoginPage(page);
        const apiPage = new ApiPage(page);
        const billingPage = new BillingPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        userId = await loginPage.register(userEmail);
        await context.storageState({ path: statePath });
        await apiPage.createWorkspace(TestData.WORKSPACE.RANDOM_WORKSPACE_NAME, statePath);

        await billingPage.clickElement(billingPage.headerBillingIcon);
        await billingPage.checkBillingPageIsOpened();
        await billingPage.checkNoAddedPaymentMethod();
        await billingPage.elementDisplayed(billingPage.addPaymentMethodBtn);
        await billingPage.clickElement(billingPage.addPaymentMethodBtn);
        await billingPage.addPaymentMethod(TestData.WORKSPACE.CARD_EXAMPLE_1);
        await billingPage.checkPaymentAdded(cardName);
    });

    test('verify that user can successfully edit card details', async ({ page }) => {
        const billingPage = new BillingPage(page);
        const loginPage = new LoginPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.VALID_EMAIL_EXAMPLE);

        await billingPage.clickElement(billingPage.headerBillingIcon);
        await billingPage.clickElement(billingPage.editCardDetails);
        await billingPage.buttonIsDisabled(billingPage.saveEditedCardDetails);
        await billingPage.typeInInput(billingPage.cardNameInput, 'editedName');
        await billingPage.buttonIsEnabled(billingPage.saveEditedCardDetails);
        await billingPage.clickElement(billingPage.saveEditedCardDetails);
        await billingPage.checkAlertMessage(TestData.MESSAGES.PAYMENT_UPDATED);
        await billingPage.elementHaveText(billingPage.addedCardName, 'editedName');
    });
    test('verify that user can change default card', async ({ page }) => {
        const billingPage = new BillingPage(page);
        const loginPage = new LoginPage(page);

        await page.goto(`/home`);
        await loginPage.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.VALID_EMAIL_EXAMPLE);

        await billingPage.clickElement(billingPage.headerBillingIcon);
        await billingPage.elementDisplayed(billingPage.addPaymentMethodBtn);
        await billingPage.clickElement(billingPage.addPaymentMethodBtn);
        await billingPage.addPaymentMethod(TestData.WORKSPACE.CARD_EXAMPLE_2);
        await billingPage.checkAlertMessage(TestData.MESSAGES.PAYMENT_ADDED);
        await billingPage.clickElement(billingPage.viewAll);
        await billingPage.clickElement(billingPage.moreIcon);
        await billingPage.clickElement(billingPage.setAsDefault);
        await page.waitForTimeout(2000);
        await billingPage.clickElement(billingPage.closeModal);
        await billingPage.elementHaveText(billingPage.addedCardName, cardName);
        await billingPage.elementDisplayed(billingPage.defaultPayment);
    });
    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const apiPage = new ApiPage(page);
        await apiPage.deleteUserFromCpAdmin(userId);
    });
});
