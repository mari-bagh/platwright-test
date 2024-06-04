import { expect } from '@playwright/test';

import type { Page } from '@playwright/test';

import ApiPage from './api.page';
import BasePage from './base.page';
import TestData from '../helpers/test.data';

export default class RolePage extends BasePage {
    constructor(
        page: Page,
        readonly createRoleButton = page.locator('[data-testid="create-role-button"]'),
        readonly detailsTab = page.locator('[data-testid="details"]'),
        readonly permissionsTab = page.locator('[data-testid="permissions"]'),
        readonly roleNameInput = page.locator('input[name="role"]'),
        readonly saveRoleButton = page.locator('[data-testid="save-role-button"]'),
        readonly roleNameMessage = page.locator('[class*="MuiFormControl"] p'),
        readonly permissionItems = page.locator('[data-testid="permissions-items"]'),
        readonly portalPermission = page.locator('[data-testid="ExpandMoreIcon"]').nth(0),
        readonly addMemberCheckbox = page.locator('[data-testid^="checkbox-"]').nth(0),
        readonly confirmRoleDeletion = page.locator('[data-testid="confirm-role-delete"]'),
        readonly editIcon = page.locator('tbody rect').nth(0),
        readonly membersTab = page.locator('[data-testid="members"]'),
        readonly addMembersButton = page.locator('button[data-testid="add-members-from-role"]'),
        readonly addMembersBtnInModal = page.locator('[data-testid="add-members-from-modal"]'),
        readonly addMembersModal = page.locator('[data-testid="add-members-modal"]'),
        readonly rolePlusIcon = page.locator('[data-testid="role-plus-icon"]'),
        readonly permissionToggle = page.locator('[data-testid$="-toggle"]').getByRole('checkbox').nth(0),
        readonly membersInList = page.locator('[data-testid="add-role-modal"] p').last(),
        readonly cancelRoleEdit = page.locator('button:has-text("Cancel")')
    ) {
        super(page);
    }

    async roleDisplayInTable(roleName: string): Promise<void> {
        const roleVisible = false;
        await this.page.waitForSelector('tbody');
        while (!roleVisible) {
            const nextButton = this.page.locator('[data-testid="NavigateNextIcon"]');
            const createdRole = this.page.locator(`[value="${roleName}"]`);
            await this.page.waitForLoadState('load');
            await this.page.waitForTimeout(3000);
            if (!(await createdRole.isVisible())) {
                await nextButton.click();
                continue;
            }
            await expect(createdRole).toBeVisible();
            break;
        }
    }
    async checkMemberAddedToRole(roleName: string): Promise<void> {
        const plusIcon = this.rolePlusIcon;
        if (plusIcon) {
            await plusIcon.click();
            const roleListItems = await this.page.$$('[data-testid="role-items"]');
            for (const element of roleListItems) {
                if ((await element.textContent()) === roleName) {
                    break;
                }
            }
        } else {
            await this.elementHaveText(this.roleInActiveTab, roleName);
            await this.page.waitForLoadState();
        }
    }
    async deleteRoleByUI(roleName: string): Promise<void> {
        await this.roleDisplayInTable(roleName);
        await this.page.waitForLoadState();
        await this.page
            .getByRole('row', { name: roleName + ' 0' })
            .getByTestId('delete-role-icon')
            .click();
        await super.clickElement(this.confirmRoleDeletion);
        await super.checkAlertMessage(TestData.MESSAGES.ROLE_DELETED);
    }
    async checkMemberAddedToModal(roleName: string, memberEmail: string): Promise<void> {
        await this.page
            .getByRole('row', { name: roleName + ' 1' })
            .getByTestId('edit-icon')
            .click();
        await super.checkModalIsOpened('Edit Role');
        await super.clickElement(this.membersTab);
        await super.elementHaveText(this.membersInList, memberEmail);
    }

    async goToRoleDetails(roleName: string): Promise<void> {
        await this.roleDisplayInTable(roleName);
        await this.page.waitForLoadState('load');
        await this.page.waitForTimeout(3000);
        await this.page.getByRole('row', { name: roleName }).getByTestId('edit-icon').click();
        await super.checkModalIsOpened('Edit Role');
    }
    async saveRole(): Promise<string> {
        const apiPage = new ApiPage(this.page);
        await super.clickElement(this.saveRoleButton);
        const response = await apiPage.getResponseData('roles');
        await super.checkAlertMessage(TestData.MESSAGES.ROLE_CREATED);
        return response.data.id;
    }
    async selectRolePermissions(): Promise<void> {
        await super.clickElement(this.portalPermission);
        await expect(this.permissionToggle).not.toBeChecked();
        await super.clickElement(this.permissionToggle);
    }
    async fillRoleDetails(roleName: string): Promise<void> {
        await super.typeInInput(this.roleNameInput, roleName);
        await super.pickRandomColorAndCheck();
    }
}
