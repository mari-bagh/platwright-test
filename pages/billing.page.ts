import dayjs from 'dayjs';

import type { Page } from '@playwright/test';

import BasePage from './base.page';
import TestData from '../helpers/test.data';

export default class BillingPage extends BasePage {
    constructor(
        page: Page,
        readonly addCardIcon = page.locator("[data-testid='AddIcon']").last(),
        readonly homeTab = page.locator('[data-testid="home-tab"]'),
        readonly historyTab = page.locator('[data-testid="history-tab"]'),
        readonly cardNumberField = page.locator('[name="number"]'),
        readonly cardExpirationField = page.locator('#Field-expiryInput'),
        readonly cardCvcField = page.locator('#Field-cvcInput'),
        readonly savePaymentButton = page.locator('[data-testid="save-payment-button"]'),
        readonly selectCountryDropdown = page.locator('#Field-countryInput'),
        readonly addedPaymentBlock = page.locator('[data-testid="added-payment-block"]'),
        readonly addedCardName = page.locator('[data-testid="added-payment-block"] p').first(),
        readonly defaultPayment = page.locator('[data-testid="added-payment-block"] span:has-text("Default")'),
        readonly editCardDetails = page.locator('[data-testid="open-edit-payment-modal"]'),
        readonly saveEditedCardDetails = page.locator('[data-testid="edit-payment-button"]'),
        readonly cardNameInput = page.locator('[name="name"]'),
        readonly zipCodeInput = page.locator('[id="Field-postalCodeInput"]'),
        readonly serviceName = page.locator('tbody tr td').first(),
        readonly totalPrice = page.locator('tbody tr td').nth(3),
        readonly invoiceNumber = page.locator('tbody tr td').nth(1),
        readonly requestsCount = page.locator('tbody tr td').nth(1),
        readonly statusColumn = page.locator('tbody tr td').nth(5),
        readonly amountColumn = page.locator('tbody tr td').nth(4),
        readonly issuedDate = page.locator('tbody tr td').nth(2),
        readonly firstInvoiceViewIcon = page.locator('tbody tr').first().getByTestId('view-icon'),
        readonly invoiceDetailsNumber = page.locator('[data-testid="details-invoice-number"]'),
        readonly invoiceIssuedDate = page.locator('[data-testid="details-issued-date"]'),
        readonly invoiceDueDate = page.locator('[data-testid="details-due-date"]'),
        readonly paymentNet = page.locator('[data-testid="details-payment-net"]'),
        readonly detailsPaymentStatus = page.locator('[data-testid="details-invoice-status"] div'),
        readonly payInvoiceBtn = page.locator('[data-testid="pay-invoice-button"]').first(),
        readonly payBtn = page.locator('[data-testid="pay-button"]'),
        readonly viewAll = page.locator('[data-testid="added-payment-block"] p:has-text("View All")'),
        readonly moreIcon = page.locator('[data-testid="MoreVertIcon"]').nth(0),
        readonly setAsDefault = page.locator('[role="menu"] p:has-text("Set as default")'),
        readonly closeModal = page.locator('[name="x-close-stroke"]'),
        readonly addPaymentMethodBtn = page.locator('[data-testid="open-payment-modal"]'),
        readonly exportInvoicesBtn = page.locator('[data-testid="export-invoices-button"]')
    ) {
        super(page);
    }

    async addPaymentMethod(cardNumber: string): Promise<void> {
        const iframeSelector = this.page.frameLocator('iframe[title="Secure payment input frame"]');
        await iframeSelector.locator(this.cardNumberField).fill(cardNumber);
        await iframeSelector.locator(this.cardExpirationField).fill('12 / 30');
        await iframeSelector.locator(this.cardCvcField).fill('123');
        const zipInput = iframeSelector.locator(this.zipCodeInput);
        if (await zipInput.isVisible()) {
            await iframeSelector.locator(this.zipCodeInput).fill('12345');
        }
        await super.clickElement(this.savePaymentButton);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(5000);
    }
    async checkUsageIsCreated(
        serviceName: string,
        requestCount: number,
        pricePerUnit: number,
        quantity: number,
        currentPrice: number
    ): Promise<void> {
        await this.page.reload();
        await this.clickElement(this.usageTab);
        // await this.tabIsActive(this.usageTab);
        await this.elementHaveText(this.serviceName, serviceName);
        await this.elementHaveText(this.requestsCount, `${requestCount + 1} Requests`);
        const totalPrice = currentPrice + pricePerUnit * quantity;
        await this.elementHaveText(
            this.totalPrice,
            '$' + totalPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        );
    }
    async checkSingleInvoiceDetails(invoiceNumber: string, status: string): Promise<void> {
        const createdDate = dayjs().format('MM/DD/YY');
        const netPayment = await this.returnElementText(this.paymentNet);
        const netPaymentValue = Number(netPayment.replace('Net', '').trim());
        const dueDate = dayjs().add(netPaymentValue, 'day').format('MM/DD/YY');
        await this.elementHaveText(this.invoiceDetailsNumber, invoiceNumber);
        await this.elementHaveText(this.invoiceIssuedDate, createdDate);
        await this.elementHaveText(this.invoiceDueDate, dueDate);
        await this.elementHaveText(this.detailsPaymentStatus, status);
    }
    async checkUsageCurrentData(): Promise<{ requestCount: number; totalPrice: number }> {
        await this.clickElement(this.headerBillingIcon);
        await this.clickElement(this.usageTab);
        const requestsCount = await this.returnElementValue(this.requestsCount);
        const totalPrice = await this.returnElementText(this.totalPrice);
        return {
            totalPrice: Number(totalPrice.slice(1).replaceAll(',', '')),
            requestCount: parseInt(requestsCount)
        };
    }
    async checkInvoiceDetailsInTable(amount: number, status: string): Promise<string> {
        await this.elementHaveText(this.issuedDate, dayjs().format('MM/DD/YY'));
        await this.elementHaveText(
            this.amountColumn,
            `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        );
        await this.elementHaveText(this.statusColumn, status);
        return this.returnElementText(this.invoiceNumber);
    }
    async checkPaymentAdded(cardName: string): Promise<void> {
        await super.checkAlertMessage(TestData.MESSAGES.PAYMENT_ADDED);
        await super.elementHaveText(this.addedCardName, cardName);
        await super.elementDisplayed(this.defaultPayment);
    }
    async checkBillingPageIsOpened(): Promise<void> {
        await this.elementHaveText(this.sectionHeader, 'Billing');
        await this.page.waitForLoadState('domcontentloaded');
        // await this.tabIsActive(this.homeTab);
    }
    async payInvoice(): Promise<void> {
        await this.clickElement(this.payInvoiceBtn);
        await this.clickElement(this.payBtn);
        await this.checkAlertMessage(TestData.MESSAGES.SUCCESSFULLY_PAYED);
    }
    async checkNoAddedPaymentMethod(): Promise<void> {
        await this.elementHaveText(this.addedPaymentBlock, 'No Payment Added');
    }
}
