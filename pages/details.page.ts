import type { Page } from '@playwright/test';

import BasePage from './base.page';
import TestData from '../helpers/test.data';

export default class DetailsPage extends BasePage {
    constructor(
        page: Page,
        readonly transferOwnershipBtn = page.locator("[data-testid='transfer-ownership-button']"),
        readonly nextButton = page.locator('[data-testid="transfer-owner-next"]'),
        readonly agreeCheckbox = page.locator('[data-testid="tansfer-ownership-checkbox"]'),
        readonly transferOwnershipConfirm = page.locator('[data-testid="transfer-owner-confirm-btn"]')
    ) {
        super(page);
    }
    async transferOwnership(userEmail: string): Promise<void> {
        await this.elementDisplayed(this.transferOwnershipBtn);
        await this.clickElement(this.transferOwnershipBtn);
        await this.fillInInput(this.searchInput, userEmail);
        await this.buttonIsDisabled(this.nextButton);
        await this.clickElement(this.radioButton);
        await this.buttonIsEnabled(this.nextButton);
        await this.clickElement(this.nextButton);
        await this.clickElement(this.radioButton);
        await this.buttonIsEnabled(this.nextButton);
        await this.clickElement(this.nextButton);
        await this.buttonIsDisabled(this.transferOwnershipConfirm);
        await this.clickElement(this.agreeCheckbox);
        await this.buttonIsEnabled(this.transferOwnershipConfirm);
        await this.clickElement(this.transferOwnershipConfirm);
    }
    async checkOwnershipIsTransferred(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        await this.checkAlertMessage(TestData.MESSAGES.SUCCESSFULLY_TRANSFERRED);
        await this.page.waitForTimeout(2000);
        await this.elementNotDisplayed(this.transferOwnershipBtn);
    }
}
