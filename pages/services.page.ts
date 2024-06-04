import { expect } from '@playwright/test';

import type { Page } from '@playwright/test';

import BasePage from './base.page';

export default class ServicesPage extends BasePage {
    constructor(
        page: Page,
        readonly confirmService = page.locator('[data-testid="service-enablement-confirm-btn"]'),
        readonly confirmServiceForSpace = page.locator('[data-testid="service-confirm-btn"]'),
        readonly transcriptionService = page.locator("[data-testid='create-service-request']"),
        readonly serviceToggle = page.locator('[data-testid="service-toggle"]'),
        readonly serviceName = page.locator('[data-testid="service-name"]'),
        readonly checkAllSubspaces = page.locator("[data-testid='bulk-subspace-checkbox']"),
        readonly exportRequestsTable = page.locator('[data-testid="export-requests-table-btn"]')
    ) {
        super(page);
    }
    async selectRandomService(): Promise<string> {
        const itemsCount = (await this.page.$$('[data-testid="service-toggle"]')).length;
        const randomIndex = Math.floor(Math.random() * itemsCount);
        const selectedItem = this.serviceToggle.nth(randomIndex);
        await selectedItem.click();
        const selectedServiceName = await this.serviceName.nth(randomIndex).textContent();
        return selectedServiceName;
    }
    async turnOnOffServiceForSubspacesFromSpace(message: string): Promise<void> {
        await this.clickElement(this.serviceToggle);
        await this.checkAlertMessage(message);
        await this.clickElement(this.checkAllSubspaces);
        await this.clickElement(this.confirmServiceForSpace);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000);
    }
    async checkServiceEnabledOrDisabledForSubspace(serviceName: string, enabled: boolean): Promise<void> {
        await super.elementHaveText(this.serviceName, serviceName);
        const toggle = this.page.getByRole('checkbox');
        if (enabled) {
            await expect(toggle).toBeChecked();
        } else {
            await expect(toggle).not.toBeChecked();
        }
    }
    async enableDisableService(serviceName: string): Promise<void> {
        await this.page
            .locator('div')
            .filter({ hasText: new RegExp(`^${serviceName}$`) })
            .getByTestId('service-toggle')
            .click();
        await this.clickElement(this.confirmService);
        await this.page.waitForLoadState();
    }
    async checkTranscriptionService(enable: boolean): Promise<void> {
        await this.page.waitForTimeout(2000);
        if (enable) {
            await this.elementDisplayed(this.transcriptionService);
        } else {
            await this.elementNotDisplayed(this.transcriptionService);
        }
    }
    async turnOffService(): Promise<void> {
        await super.clickElement(this.serviceToggle);
        await super.clickElement(this.confirmServiceForSpace);
        // await super.checkAlertMessage(TestData.MESSAGES.SERVICE_DISABLED);
    }
    async turnOnService(): Promise<void> {
        await super.clickElement(this.serviceToggle);
        await super.clickElement(this.confirmServiceForSpace);
        // await super.checkAlertMessage(TestData.MESSAGES.SERVICE_ENABLED);
    }
    async checkServiceIsEnabledForSpace(serviceName: string): Promise<void> {
        await this.page.waitForTimeout(6000);
        await super.elementHaveText(this.serviceName, serviceName);
    }
}
