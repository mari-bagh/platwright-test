import type { Page } from '@playwright/test';

import ApiPage from './api.page';
import BasePage from './base.page';
import TestData from '../helpers/test.data';
export default class SpacePage extends BasePage {
    constructor(
        page: Page,
        readonly addSpaceIcon = page.locator('ul [data-testid="AddIcon"]'),
        readonly createSpaceBtn = page.locator('[data-testid="create-space-button"]'),
        readonly nameInput = page.locator('input[name="name"]'),
        readonly spaceErrorMessage = page.locator('[data-test-id="space-error-message"]'),
        readonly navBarArrowIcon = page.locator('[data-testid="KeyboardDoubleArrowRightOutlinedIcon"]'),
        readonly addSubspaceOption = page.locator('[data-testid="add-subspace-option"]'),
        readonly subspaceName = page.locator('[data-testid="create-space-modal"] input'),
        readonly saveDetails = page.locator('[data-testid="save-details-btn"]'),
        readonly uploadPhoto = page.locator('[data-testid="file-upload-container"]'),
        readonly removeIcon = page.locator('[data-testid="DeleteIcon"]'),
        readonly confirmDelete = page.getByRole('button', { name: 'Delete' }),
        readonly spaceSettings = page.locator('[data-testid="space-settings"]'),
        readonly deleteSpace = page.locator('[data-testid="delete-space"]'),
        readonly deleteSpaceButton = page.locator('[data-testid="delete-space-button"]')
    ) {
        super(page);
    }
    async deleteSpaceByUi(spaceName: string): Promise<void> {
        await this.page.locator(`[data-testid="${spaceName}"]`).hover();
        await this.page.locator(`[data-testid="${spaceName}"] [data-testid="MoreVertIcon"]`).click();
        await super.clickElement(this.deleteSpace);
        await super.checkModalIsOpened('Delete Space');
        await super.buttonIsDisabled(this.deleteSpaceButton);
        await super.clickElement(this.deleteSpaceAgree);
        await super.buttonIsEnabled(this.deleteSpaceButton);
        await super.clickElement(this.deleteSpaceButton);
        await super.checkAlertMessage(TestData.MESSAGES.SPACE_DELETED);
    }
    async checkSubspaceCreated(spaceName: string, subspaceName: string): Promise<void> {
        const apiPage = new ApiPage(this.page);
        await apiPage.getResponseData('spaces');
        await super.checkAlertMessage(TestData.MESSAGES.SUBSPACE_CREATED);
        await this.page.locator(`[data-testid="${spaceName}"] [data-testid="ExpandMoreIcon"]`).click();
        const subspace = this.page.locator(`[title="${subspaceName}"]`);
        await this.page.waitForTimeout(1500);
        await super.elementDisplayed(subspace);
    }
    async goToSpaceSections(spaceName: string, section: string): Promise<void> {
        await this.page.locator(`[data-testid="${spaceName}"]`).hover();
        await this.page.locator(`[data-testid="${spaceName}"] [data-testid="MoreVertIcon"]`).click();
        await super.clickElement(this.spaceSettings);
        await this.clickElementByText(section);
        await this.page.waitForTimeout(1000);
        await this.elementHaveText(this.sectionHeader, section);
    }
    async checkSpaceCreated(spaceName: string): Promise<string> {
        const apiPage = new ApiPage(this.page);
        const response = await apiPage.getResponseData('spaces');
        const space_id = response.data.id;
        await super.checkAlertMessage(TestData.MESSAGES.SPACE_CREATED);
        const space = this.page.locator(`[data-testid="${spaceName}"]`);
        await super.elementDisplayed(space);
        return space_id;
    }
    async createSpace(spaceName: string): Promise<void> {
        await super.pickRandomColorAndCheck();
        await super.buttonIsDisabled(this.createSpaceBtn);
        await super.fillInInput(this.nameInput, spaceName);
        await super.buttonIsEnabled(this.createSpaceBtn);
        await super.clickElement(this.createSpaceBtn);
    }
    async createSubspace(subspaceName: string): Promise<void> {
        await super.buttonIsDisabled(this.createSpaceBtn);
        await super.fillInInput(this.subspaceName, subspaceName);
        await super.buttonIsEnabled(this.createSpaceBtn);
        await super.clickElement(this.createSpaceBtn);
    }
    async openSubspaceModal(spaceName: string): Promise<void> {
        await this.page.locator(`[data-testid="${spaceName}"]`).hover();
        await this.page.locator(`[data-testid="${spaceName}"] [data-testid="MoreVertIcon"]`).click();
        await super.clickElement(this.addSubspaceOption);
    }
    async checkSpaceIsDeleted(spaceName: string): Promise<void> {
        await this.page.waitForTimeout(3000);
        const deletedSpace = this.page.locator(`[data-testid="${spaceName}"]`);
        await super.elementNotDisplayed(deletedSpace);
    }
}
