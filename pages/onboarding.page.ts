import type { Page } from '@playwright/test';

import BasePage from './base.page';
import TestData from '../helpers/test.data';

export default class OnboardingPage extends BasePage {
    constructor(
        page: Page,
        readonly workspaceNameInput = page.locator('[data-testid="workspace-name"] input'),
        readonly saveWorkspaceBtn = page.locator('[data-testid="save-name-button"]'),
        readonly savePickedColorBtn = page.locator('[data-testid="save-color-button"]'),
        readonly inviteInput = page.locator('[data-testid="invite-team"] input'),
        readonly industryInput = page.locator('input[name="industry"]'),
        readonly roleInput = page.locator('input[name="role"]'),
        readonly saveIndustryBtn = page.locator('[data-testid="save-industry-btn"]'),
        readonly saveServiceBtn = page.locator('[data-testid="save-service-btn"]'),
        readonly sendInviteBtn = page.locator('[data-testid="done-btn"]'),
        readonly doneBtn = page.locator('[data-testid="done-btn"]'),
        readonly saveRoleBtn = page.locator('[data-testid="save-role-btn"]'),
        readonly descriptionNextBtn = page.locator('[data-testid="description-next-button"]'),
        readonly teamSizeNextBtn = page.locator('[data-testid="team-size-next-btn"]'),
        readonly serviceList = page.locator('[data-testid^="service-"]'),
        readonly teamList = page.locator('[data-testid^="team-"]'),
        readonly industryList = page.locator('[data-testid^="industry-"]'),
        readonly reasonsLIst = page.locator("[data-testid$='-reason']"),
        readonly rolesList = page.locator('[data-testid^="role-"]'),
        readonly welcoming = page.locator("[data-testid='welcoming-text']"),
        readonly uploadWorkspaceLogo = page.locator('[data-testid="CloudUploadOutlinedIcon"]')
    ) {
        super(page);
    }
    async describeRole(): Promise<void> {
        const role = await super.selectRandomOption(this.rolesList, 7);
        if (role === 'Other') {
            await this.page.waitForTimeout(1000);
            await super.fillInInput(this.roleInput, 'role');
        }
        await super.clickElement(this.saveRoleBtn);
    }
    async selectIndustry(): Promise<void> {
        const industry = await super.selectRandomOption(this.industryList, 11);
        if (industry === 'Other') {
            await super.typeInInput(this.industryInput, 'industry');
        }
        await super.clickElement(this.saveIndustryBtn);
    }
    async enterWorkspaceName(workspaceName: string): Promise<void> {
        await this.fillInInput(this.workspaceNameInput, workspaceName);
        await this.clickElement(this.saveWorkspaceBtn);
        await super.getResponseData('organizations');
    }
    async inviteTeam(): Promise<void> {
        await super.fillInInput(this.inviteInput, TestData.USER.VALID_EMAIL_EXAMPLE);
        await super.clickElement(this.sendInviteBtn);
    }
    async doneOnBoarding(): Promise<void> {
        await super.clickElement(this.doneBtn, 10000);
        await super.checkAlertMessage(TestData.MESSAGES.WORKSPACE_CREATED);
    }
    async selectService(): Promise<void> {
        await super.selectRandomOption(this.serviceList, 6);
        await super.clickElement(this.saveServiceBtn);
    }
    async selectTeamSize(): Promise<void> {
        await super.selectRandomOption(this.teamList, 5);
        await super.clickElement(this.teamSizeNextBtn);
    }
    async pickLogoColor(): Promise<void> {
        await super.pickRandomColorAndCheck();
        await super.clickElement(this.savePickedColorBtn);
    }
    async selectReason(): Promise<void> {
        await super.selectRandomOption(this.reasonsLIst);
    }
}
