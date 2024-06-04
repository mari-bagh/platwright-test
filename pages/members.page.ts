import dayjs from 'dayjs';

import type { Page } from '@playwright/test';

import BasePage from './base.page';
import TestData from '../helpers/test.data';
const currentDate = dayjs();

export default class MembersPage extends BasePage {
    constructor(
        page: Page,
        readonly inviteMemberBtn = page.locator('[data-testid="invite-member-button"]'),
        readonly inviteEmailInput = page.locator('[data-testid="email-container"] [type="text"]'),
        readonly openRolesList = page.locator('[data-testid="email-container"] [aria-haspopup="listbox"]'),
        readonly rolesListOptions = page.locator('[role="option"]'),
        readonly addMemberBtn = page.locator('[data-testid="add-member-email"]'),
        readonly addedMember = page.locator('[data-testid="members-container"] p').nth(0),
        readonly selectedRole = page.locator('[class*="MuiChip-label"]').last(),
        readonly sendInviteBtn = page.locator('[data-testid="send-invite-button"]'),
        readonly invitationTab = page.locator('[data-testid="invitations-tab"]'),
        readonly tableBody = page.locator('tbody tr td'),
        readonly revokeMember = page.locator('[data-testid="remove-member-icon"]'),
        readonly copyLink = page.locator('[data-testid="copy-link"]'),
        readonly activeTab = page.locator('[data-testid="members-tab"]'),
        readonly membersEmailColumn = page.locator('tbody tr td:nth-child(3)').last(),
        readonly addedDate = page.locator('tbody tr td:nth-child(4)').last(),
        readonly access = page.locator('tbody tr td:nth-child(5) div p').last(),
        readonly role = page.locator('tbody tr td:nth-child(6) div p').first(),
        readonly addSpaceMember = page.locator('[data-testid="add-member-button"]'),
        readonly checkbox = page.locator('[data-testid^="checkbox-"]').nth(0),
        readonly addMembersBtnInModal = page.locator('[data-testid="add-members-from-modal"]'),
        readonly addMembersModal = page.locator('[data-testid="add-members-modal"]'),
        readonly revokeInvitation = page.locator('button:has-text("Revoke")'),
        readonly addedMemberRole = page.locator('[data-testid="add-members-modal"] span').first(),
        readonly removeConfirm = page.locator('[data-testid="remove-member-confirm"]'),
        readonly revokeInvitedMember = page.locator('[data-testid="revoke-confirm-btn"]'),
        readonly editIcon = page.locator('[data-testid="edit-icon"]'),
        readonly memberInfo = page.locator("[data-testid='member-info']"),
        readonly addedDateInModal = page.locator('[data-testid="Date Added-field"] p').last(),
        readonly memberEmailModal = page.locator('[data-testid="Email-field"] p').last(),
        readonly memberNameInModal = page.locator('[data-testid="Name-field"] p').last(),
        readonly accessTab = page.locator('[data-testid="access"]'),
        readonly roleTab = page.locator('[data-testid="role"]'),
        readonly tabContent = page.locator('[data-testid$="-tab-content"] p').last(),
        readonly noSpaces = page.locator('[data-testid="access-tab-content"] p').first(),
        readonly cancelMemberEdit = page.locator('[data-testid="cancel-changes-btn"]'),
        readonly bulkCheckbox = page.locator('thead [type="checkbox"]'),
        readonly exportMembersTable = page.locator('[data-testid="export-members-table-btn"]')
    ) {
        super(page);
    }
    async checkMemberInfo(memberEmail: string, role: string, space_name?: string): Promise<void> {
        const createdDate = currentDate.locale('en').format('MMM DD, YYYY');
        const memberName = memberEmail.split('@')[0];
        await super.clickElement(this.editIcon);
        await super.checkModalIsOpened('Edit Member');
        await super.elementHaveText(this.memberInfo, memberName);
        await super.elementHaveText(this.memberNameInModal, memberName);
        await super.elementHaveText(this.memberEmailModal, memberEmail);
        await super.elementHaveText(this.addedDateInModal, createdDate);
        if (space_name) {
            await super.clickElement(this.accessTab);
            await super.elementHaveText(this.tabContent, space_name);
        } else {
            await super.clickElement(this.accessTab);
            await super.elementHaveText(this.noSpaces, 'No assigned spaces');
        }
        await super.clickElement(this.roleTab);
        await super.elementHaveText(this.tabContent, role);
        await super.clickElement(this.cancelMemberEdit);
    }
    async userAddedToMembersList(memberEmail: string, role: string, space_name?: string): Promise<void> {
        const createdDate = currentDate.locale('en').format('MMM DD, YYYY');
        await this.page.waitForTimeout(3000);
        await this.page.waitForLoadState();
        await this.clickElement(this.searchIcon);
        await super.fillInInput(this.searchInput, memberEmail);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000);
        await super.elementHaveText(this.membersEmailColumn, memberEmail);
        await super.elementHaveText(this.addedDate, createdDate);
        await super.elementHaveText(this.role, role);
        if (space_name) {
            await super.elementHaveText(this.access, space_name);
        }
    }
    async addSpaceMembers(): Promise<{ email: string; role: string }> {
        await this.page.waitForLoadState();
        await this.page.waitForSelector('[class*="MuiChip-root"]', { timeout: 100000 });
        await this.page.waitForTimeout(3000);
        await super.buttonIsDisabled(this.addMembersBtnInModal);
        await super.clickElement(this.checkbox);
        const addedMemberEmail = `${await this.emailInList.innerText()}@testing.qa`;
        const addedMemberRole = await this.addedMemberRole.innerText();
        await super.buttonIsEnabled(this.addMembersBtnInModal);
        await super.clickElement(this.addMembersBtnInModal);
        await this.page.waitForLoadState();
        return { email: addedMemberEmail, role: addedMemberRole };
    }
    async getLinkFromGuerrila(userEmail: string): Promise<void> {
        await this.page.goto('https://www.guerrillamail.com/inbox');
        await this.clickElement(this.guerrillaMailSearchField);
        await this.page.keyboard.press('Backspace');
        await this.guerrillaMailSearchForDomain.fill(userEmail);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(10000);
        await this.clickElement(this.guerrillaMailSearchField);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(3000);
        await this.clickElement(this.guerrillaMailTableFirstRow);
        await this.page.waitForTimeout(4000);
        await this.clickElement(this.guerrillaMailStartScreening);
    }
    async fillAndValidateInviteModal(invitedMemberEmail: string): Promise<string> {
        await super.fillInInput(this.inviteEmailInput, invitedMemberEmail);
        await super.buttonIsDisabled(this.addMemberBtn);
        await this.page.keyboard.press('Enter');
        await super.clickElement(this.openRolesList);
        const selectedRole = await this.selectRandomOption(this.rolesListOptions);
        await super.buttonIsEnabled(this.addMemberBtn);
        await super.clickElement(this.addMemberBtn);
        await super.elementHaveText(this.addedMember, invitedMemberEmail);
        await super.elementHaveText(this.selectedRole, selectedRole);
        await super.buttonIsEnabled(this.sendInviteBtn);
        return selectedRole;
    }
    async memberIsShownInPendingList(email: string, role: string): Promise<void> {
        const futureDate = currentDate.add(7, 'day');
        const expiredDate = futureDate.locale('en').format('MMM DD, YYYY');
        const createdDate = currentDate.locale('en').format('MMM DD, YYYY');
        await super.fillInInput(this.invitedMemberSearch, email);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(3000);
        await super.elementHaveText(this.emailRow, email);
        await super.elementHaveText(this.roleRow, role);
        await super.elementHaveText(this.addedDateRow, createdDate);
        await super.elementHaveText(this.expiredDateRow, expiredDate);
    }
    async searchInvitedMember(invitedMemberEmail: string): Promise<void> {
        await this.clickElement(this.invitationTab);
        await this.tabIsActive(this.invitationTab);
        await this.page.waitForTimeout(3000);
        await this.typeInInput(this.invitedMemberSearch, invitedMemberEmail);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(9000);
    }
    async memberBulkDelete(): Promise<void> {
        await super.clickElement(this.bulkCheckbox);
        await super.elementDisplayed(this.page.getByText('member(s) selected'));
        await super.clickElement(this.page.locator('[data-testid="remove-member-icon"]').first());
        await super.clickElement(this.removeConfirm);
        await super.checkAlertMessage(TestData.MESSAGES.MEMBER_DELETED);
    }
    async checkUserIsDeleted(memberEmail: string): Promise<void> {
        await super.checkAlertMessage(TestData.MESSAGES.MEMBER_DELETED);
        await super.fillInInput(this.searchInput, memberEmail);
        await this.page.waitForLoadState();
        await this.page.waitForTimeout(3000);
        await super.elementContainText(this.tableBody, 'No records to display');
    }
    async deleteMemberByUI(memberEmail: string): Promise<void> {
        await super.fillInInput(this.searchInput, memberEmail);
        await this.page.waitForLoadState();
        await this.page.waitForTimeout(3000);
        await super.clickElement(this.revokeMember);
        await super.clickElement(this.removeConfirm);
    }
    async inviteMember(invitedMember: string): Promise<void> {
        await this.clickElement(this.inviteMemberBtn);
        await this.fillAndValidateInviteModal(invitedMember);
        await this.clickElement(this.sendInviteBtn);
        await super.getResponseData('organizations-invitations');
    }
    async copyInvitationLink(): Promise<string> {
        await this.page.waitForSelector('[data-testid="copy-link"]');
        await this.clickElement(this.copyLink);
        const clipboardText = await this.page.evaluate(() => navigator.clipboard.readText());
        return clipboardText;
    }
}
