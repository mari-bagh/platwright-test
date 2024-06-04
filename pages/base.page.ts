import XLSX from 'xlsx';
import path from 'path';
import * as fs from 'node:fs';
import csvParser from 'csv-parser';
import { expect } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

export default class BasePage {
    readonly page: Page;

    constructor(
        page: Page,
        readonly homeIcon = page.locator('[data-testid="dashboard-home-icon"]'),
        readonly dashboardIcon = page.locator('[data-testid="DashboardIcon"]'),
        readonly createAccount = page.getByRole('heading', { name: 'Create Your Account' }),
        readonly modalWindow = page.locator(`[data-testid$="-modal"]`),
        readonly modalWindowHeader = page.locator(`[data-testid$="-modal"] p`).nth(0),
        readonly alertMessage = page.locator('[class*="MuiAlert-message"]'),
        readonly sectionHeader = page.locator('h4'),
        readonly userAvatar = page.locator('[data-testid="user-avatar"]'),
        readonly userSettings = page.locator('[data-testid="ManageAccountsRoundedIcon"]'),
        readonly backButton = page.locator('[data-testid="back-button"]'),
        readonly searchInput = page.locator('[type="text"]'),
        readonly searchIcon = page.locator('[name="search-filled"]'),
        readonly invitedMemberSearch = page.locator('[type="search"]'),
        readonly roleInActiveTab = page.locator('tbody tr td').nth(5),
        readonly emailRow = page.locator('tbody tr td').nth(1),
        readonly addedDateRow = page.locator('tbody tr td').nth(2),
        readonly roleRow = page.locator('tbody tr td').nth(4),
        readonly expiredDateRow = page.locator('tbody tr td').nth(5),
        readonly emailInList = page.locator('[data-testid^="email-"]').first(),
        readonly errorIcon = page.locator('[data-testid="ErrorOutlineIcon"]'),
        readonly checkbox = page.locator('[type="checkbox"]').nth(0),
        readonly firstRowCheckbox = page.locator('[type="checkbox"]').nth(1),
        readonly deleteSpaceAgree = page.locator("[data-testid='delete-space-agree']"),
        readonly saveLogo = page.locator('[data-testid="save-image-btn"]'),
        readonly radioButton = page.locator('[type="radio"]'),
        readonly settingsIcon = page.locator('[data-testid="settings-icon"]'),
        readonly notificationIcon = page.locator('[data-testid="notifications-bell-icon"]'),
        readonly firstNotification = page.locator('[role="menuitem"]').first().locator('p').last(),
        readonly headerBillingIcon = page.locator('[data-testid="header-billing-icon"]'),
        readonly usageTab = page.locator('[data-testid="usage-tab"]'),
        readonly infoIcon = page.locator('[data-testid="InfoOutlinedIcon"]'),
        readonly guerrillaMailSearchField = page.locator('#inbox-id'),
        readonly guerrillaMailSearchForDomain = page.locator('input[type="text"]').nth(1),
        readonly guerrillaMailTable = page.locator('#email_table'),
        readonly guerrillaMailTableFirstRow = guerrillaMailTable.locator('tbody tr').first(),
        readonly guerrillaMailStartScreening = page.locator('a:has-text("ACCEPT INVITATION")'),
        readonly helpIcon = page.locator('[name="SettingsIcon"]'),
        readonly exportOptionsDropdown = page.locator('[name="exportOptions"]'),
        readonly exportDropdown = page.locator(`[role="combobox"]`).last(),
        readonly exportType = page.locator('[name="exportType"]'),
        readonly exportsBtnInModal = page.locator('[data-testid="add-members-from-modal"]'),
        readonly fileNameInput = page.locator('input[name="fileName"]'),
        readonly exportModal = page.locator('[data-testid="export-invoices-modal"]'),
        readonly filterButton = page.locator('button [name="filter-line-stroke"]'),
        readonly statusCategoryCheckbox = page.locator('[name="statusCategories"]'),
        readonly applyFilters = page.locator('button:has-text("Apply filters")')
    ) {
        this.page = page;
    }

    async readFile(path: string, format: string) {
        // Helper function to modify dates in the data array
        const modifyDates = (data: any[]): void => {
            const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(20\d{2}|21\d{2})$/;
            data.forEach(item => {
                for (const key in item) {
                    if (datePattern.test(item[key])) {
                        const parts = item[key].split('/');
                        const year = parseInt(parts[2]);
                        if (year >= 2000 && year < 2100) {
                            item[key] = parts.slice(0, 2).join('/') + '/' + parts[2].substring(2);
                        }
                    }
                }
            });
        };

        if (format === 'csv') {
            const results: any[] = [];
            let count = 0;
            await new Promise<void>((resolve, reject) => {
                fs.createReadStream(path)
                    .pipe(csvParser())
                    .on('data', data => {
                        if (count < 10) {
                            results.push(data);
                            count++;
                        }
                    })
                    .on('end', () => {
                        modifyDates(results); // Modify dates after reading the CSV data
                        resolve();
                    })
                    .on('error', error => reject(error));
            });
            return results;
        } else if (format === 'xlsx') {
            const workbook = XLSX.readFile(path);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet);
            const limitedData = data.slice(0, 10);
            modifyDates(limitedData);
            return limitedData;
        } else {
            throw new Error(`Unsupported file format: ${format}`);
        }
    }

    async parseTableData(options: any, selectedRowIndex?: number): Promise<any[]> {
        const extractText = async (element: any): Promise<string> => element.innerText();
        const tableRows: any[] = await this.page.$$('tbody tr');
        const dataArray: any[] = [];

        const rowsToParse =
            typeof selectedRowIndex === 'number' && selectedRowIndex >= 0 && selectedRowIndex < tableRows.length
                ? [tableRows[selectedRowIndex]]
                : tableRows;

        for (const row of rowsToParse) {
            const cells: any[] = await row.$$('td');
            const rowData: { [columnName: string]: string } = {};
            for (const [columnName, tdIndex] of Object.entries(options)) {
                if (typeof tdIndex === 'number' && tdIndex >= 0 && tdIndex < cells.length) {
                    rowData[columnName] = await extractText(cells[tdIndex]);
                }
            }
            dataArray.push(rowData);
            if (selectedRowIndex !== undefined) break;
        }
        return dataArray;
    }

    async fillExportDataModal(tableName: string, exportOption: string, exportType: string): Promise<void> {
        await this.elementHaveAttr(
            this.fileNameInput,
            'value',
            `${tableName}${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`
        );
        const a = await this.returnElementValue(this.exportOptionsDropdown);
        expect(a).toEqual('All data');
        await this.clickElement(this.exportDropdown);
        await this.page.locator(`[role="option"]:has-text('${exportOption}')`).click();
        await this.page.locator(`[name="exportType"][value='${exportType}']`).click();
    }

    async sortTheColumn(element: Locator, column: Locator): Promise<void> {
        const originalRow = await column.allTextContents();
        await this.clickElement(element);
        const sortedRow = await column.allTextContents();
        const sort = await element.getAttribute('aria-sort');
        if (sort === 'descending') {
            const newRow = originalRow.sort((a, b) => b.localeCompare(a));
            expect(sortedRow).toEqual(newRow);
        } else if (sort === 'ascending') {
            const newRow = originalRow.sort();
            expect(sortedRow).toEqual(newRow);
        }
    }

    async compareExportedDataAndTableData(tableData: any, format: string) {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            await this.clickElement(this.exportsBtnInModal)
        ]);
        const suggestedFilename = download.suggestedFilename();
        const downloadPath = path.join('tests/fixtures', suggestedFilename);
        await download.saveAs(downloadPath);
        const fromDownloadedFile = await this.readFile(downloadPath, format);
        expect(tableData).toStrictEqual(fromDownloadedFile);
    }

    async sortFromFilter(sortColumn: string, sortOrder: string): Promise<void> {
        await this.page.locator(`[id="Sorting-header"] [name="chevron-down-outline"]`).click();
        await this.page.locator('[role="combobox"]').nth(1).click();
        await this.page.locator(`[data-value="${sortColumn}"]`).click();
        await this.page.locator('[role="combobox"]').nth(2).click();
        await this.page.locator(`[data-value="${sortOrder}"]`).click();
    }

    async pickRandomColorAndCheck(): Promise<void> {
        const colors = await this.page.$$('[aria-label="Selected Color"] button');
        const randomIndex = Math.floor(Math.random() * colors.length);
        const selectedColor = this.page.locator('[aria-label="Selected Color"] button').nth(randomIndex);
        await selectedColor.click();
        await expect(selectedColor).toHaveAttribute('aria-pressed', 'true');
    }

    async selectRandomOption(selector: Locator, itemsCount?: number): Promise<string> {
        if (!itemsCount) {
            itemsCount = (await this.page.$$('[role="group"] [type="button"]')).length;
        }
        const randomIndex = Math.floor(Math.random() * itemsCount);
        const selectedItem = selector.nth(randomIndex);
        await selectedItem.click();
        return selectedItem.innerText();
    }

    async goToWorkspaceSection(section: string): Promise<void> {
        await this.clickElement(this.userAvatar);
        await this.clickElement(this.userSettings);
        await this.clickElementByText(section);
        await this.page.waitForLoadState('domcontentloaded');
        await this.elementHaveText(this.sectionHeader, section);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async getResponseData(suffix: string, status = 201): Promise<any> {
        const response = await this.page.waitForResponse(
            response =>
                response.status() === status &&
                response.url() === `${process.env.NEXT_PUBLIC_BACKEND_URL}/${suffix}`,
            { timeout: 120000 }
        );
        return response.json();
    }
    async getUserId(): Promise<any> {
        const response = await this.page.waitForResponse(
            response =>
                response.status() === 200 && response.url() === `${process.env.AUTH0_BASE_URL}/api/auth/me`,
            { timeout: 300000 }
        );
        return response.json();
    }
    async openFilterCategory(categoryName: string, optionName: string): Promise<void> {
        await this.page.locator(`[id="${categoryName}-header"] [name="chevron-down-outline"]`).click();
        await this.page.locator(`[type="checkbox"][name="${optionName}"]`).click();
    }
    async chooseFilterAddedDate(categoryName: string, optionName: string): Promise<void> {
        await this.page.locator(`[id="${categoryName}-header"] [name="chevron-down-outline"]`).click();
        await this.page.locator(`[data-value="${optionName}"]`).click();
    }
    async checkNotifications(message: string): Promise<void> {
        await this.clickElement(this.notificationIcon);
        await this.elementHaveText(this.firstNotification, message);
        await this.page.mouse.click(0, 0);
    }

    async checkAlertMessage(message: string): Promise<void> {
        await this.page.waitForSelector('[class*="MuiAlert-message"]', { timeout: 40000 });
        await this.elementHaveText(this.alertMessage, message);
    }

    async elementHaveAttr(element: Locator, attr: string, attrValue: string): Promise<void> {
        const textContent = await element.getAttribute(attr);
        expect(textContent).toEqual(attrValue);
    }

    async elementNotContainText(element: Locator, text: string): Promise<void> {
        const textContent = await element.textContent();
        expect(textContent).not.toContain(text);
    }

    async checkModalIsOpened(text: string): Promise<void> {
        await expect(this.modalWindow).toBeVisible();
        await this.elementHaveText(this.modalWindowHeader, text);
    }

    async elementContainText(element: Locator, text: string): Promise<void> {
        const textContent = await element.innerText();
        expect(textContent.includes(text));
    }

    async returnElementValue(element: Locator): Promise<string> {
        const textContent = await element.getAttribute('value');
        return textContent;
    }

    async returnElementText(element: Locator): Promise<string> {
        const textContent = await element.innerText();
        return textContent;
    }

    async elementHaveNotText(element: Locator, message: string): Promise<void> {
        await expect(element).not.toHaveText(message);
    }

    async typeInInput(field: Locator, value: string): Promise<void> {
        await field.clear();
        await field.fill(value);
    }

    async messageIsDisplayed(element: Locator, message: string): Promise<void> {
        await expect(element).toHaveText(message);
    }

    async tabIsInactive(element: Locator): Promise<void> {
        await expect(element).toHaveAttribute('aria-selected', 'false');
    }

    async elementHaveText(element: Locator, message: string): Promise<void> {
        await expect(element).toHaveText(message);
    }

    async tabIsActive(element: Locator): Promise<void> {
        await expect(element).toHaveAttribute('aria-selected', 'true');
    }

    async clickElement(element: Locator, timeout?: number): Promise<void> {
        await element.click({ timeout: timeout });
    }

    async waitForNetworkIdle(): Promise<void> {
        await this.page.waitForLoadState('networkidle', { timeout: 100000 });
    }

    async elementDisplayed(element: Locator): Promise<void> {
        await expect(element).toBeVisible({ timeout: 10000 });
    }

    async elementNotDisplayed(element: Locator): Promise<void> {
        await expect(element).not.toBeVisible();
    }

    async clickElementByText(text: string): Promise<void> {
        await this.page.click(`:text('${text}')`);
    }

    async buttonIsDisabled(element: Locator): Promise<void> {
        await expect(element).toBeDisabled();
    }

    async buttonIsEnabled(element: Locator): Promise<void> {
        await expect(element).toBeEnabled();
    }

    async fillInInput(field: Locator, value: string): Promise<void> {
        await field.fill(value);
    }
}
