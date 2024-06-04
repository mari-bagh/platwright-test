import { request, expect } from '@playwright/test';

import BasePage from './base.page';
import LoginPage from './login.page';
import TestData from '../helpers/test.data';
interface UsageParams {
    expectedPrice: number;
    isBillable: boolean;
    quantity: number;
    sku: string;
}
export default class ApiPage extends BasePage {
    async inviteMemberByApi(
        email: string,
        stateFilePath: string,
        space_id?: string,
        roleId?: string
    ): Promise<string> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        let roleName: string;
        if (!roleId) {
            const getRoles = await context.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/roles`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const responseText = await getRoles.text();
            const respBody = JSON.parse(responseText);
            roleId = respBody.data[0].id;
            roleName = respBody.data[0].name;
        }
        const requestPayload = {
            invitations: [
                {
                    roleId: roleId,
                    email: email
                }
            ],
            spaceId: space_id
        };

        const response = await context.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations-invitations`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload),
            timeout: 100000
        });
        expect(response.status()).toBe(201);
        return roleName;
    }

    async createRoleByApi(roleName: string, stateFilePath: string, permissions?: string[]): Promise<string> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        if (!permissions) {
            permissions = [];
        }
        const requestPayload: { permissions: string[]; usersIds: string[]; name: string } = {
            permissions: permissions,
            name: roleName,
            usersIds: []
        };

        const response = await context.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/roles`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload),
            timeout: 70000
        });
        expect(response.status()).toBe(201);
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return respBody.data.id;
    }

    async createSpaceByApi(spaceName: string, stateFilePath: string, includeSlug: boolean = false): Promise<any> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const requestPayload: { logoColor: null; logoKey: null; name: string } = {
            logoColor: null,
            name: spaceName,
            logoKey: null
        };
        const response = await context.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/spaces`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload),
            timeout: 100000
        });
        expect(response.status()).toBe(201);
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return includeSlug ? { spaceSlug: respBody.data.slug, spaceId: respBody.data.id } : respBody.data.id;
    }
    async createSubspaceByApi(subspaceName: string, spaceId: string, stateFilePath: string): Promise<any> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const requestPayload: { parentId: string; name: string } = {
            name: subspaceName,
            parentId: spaceId
        };
        const response = await context.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/spaces`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload),
            timeout: 100000
        });
        expect(response.status()).toBe(201);
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return respBody.data.slug;
    }
    async createUsage(params: UsageParams, apiKey: string, stateFilePath: string): Promise<any> {
        const userInfo = await this.getUserData(stateFilePath);
        const userId = userInfo.sub;
        const context = await request.newContext();
        const requestPayload = {
            jobId: TestData.STATE.RANDOM_NUMBER,
            name: 'testExample',
            records: [params],
            userId: userId
        };
        const response = await context.post(`${process.env.WEBHOOK_URL}/services-usages`, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            data: JSON.stringify(requestPayload),
            timeout: 100000
        });
        expect(response.status()).toBe(201);
        return response.json();
    }

    async getServicesData(): Promise<any> {
        await this.loginToCpAdmin();
        const token = await this.getTokenFromHeaders(`${process.env.NEXT_PUBLIC_CP_BACKEND_URL}/admins`);
        const context = await request.newContext();
        const response = await context.get(
            `${process.env.NEXT_PUBLIC_CP_BACKEND_URL}/services-rates?page=1&limit=10&sortType=DESC&sortKey=perUnitPrice`,
            {
                headers: {
                    Authorization: token
                }
            }
        );
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return respBody.data[0];
    }

    async getAvailableMember(spaceSlug: string, stateFilePath: string): Promise<any> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const response = await context.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/spaces/${spaceSlug}/users/available?page=1`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return { userEmail: respBody.data[0].email, userId: respBody.data[0].id };
    }

    async addMemberToSpaceByApi(userId: string, spaceId: string, stateFilePath: string): Promise<void> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const requestPayload = { usersIds: [userId] };
        const response = await context.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/spaces/${spaceId}/users`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload)
        });
        expect(response.status()).toBe(201);
    }

    async deleteMemberFromSpace(userId: string, spaceId: string, stateFilePath: string): Promise<void> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const requestPayload = { usersIds: [userId] };
        const response = await context.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/spaces/${spaceId}/users`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload)
        });
        expect(response.status()).toBe(202);
    }

    async createWorkspace(name: string, stateFilePath: string): Promise<void> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const requestPayload = { name: name };
        const response = await context.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            data: JSON.stringify(requestPayload)
        });
        expect(response.status()).toBe(201);
        await this.page.reload();
    }
    async deleteUserFromCpAdmin(userId: string): Promise<void> {
        await this.loginToCpAdmin();
        const token = await this.getTokenFromHeaders(`${process.env.NEXT_PUBLIC_CP_BACKEND_URL}/admins`);
        const context = await request.newContext();
        const response = await context.put(`${process.env.NEXT_PUBLIC_CP_BACKEND_URL}/users`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: token
            },
            data: JSON.stringify({ userIds: [userId] })
        });
        expect(response.status()).toBe(202);
    }
    async transferOwnershipByApi(userId: string, stateFilePath: string): Promise<void> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const response = await context.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/organizations/transfer`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { userId: userId },
            timeout: 100000
        });
        expect(response.status()).toBe(202);
    }

    async delete(item: string, id: string, stateFilePath: string): Promise<void> {
        const token = await this.getToken(stateFilePath);
        const context = await request.newContext();
        const response = await context.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            timeout: 100000
        });
        expect(response.status()).toBe(202);
    }

    async getToken(stateFilePath: string): Promise<string> {
        const context = await request.newContext({ storageState: stateFilePath });
        const response = await context.get(`${process.env.AUTH0_BASE_URL}/api/access-token`);
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return respBody.token;
    }
    async getUserData(stateFilePath: string): Promise<string> {
        const context = await request.newContext({ storageState: stateFilePath });
        const response = await context.get(`${process.env.AUTH0_BASE_URL}/api/auth/me`);
        const responseText = await response.text();
        const respBody = JSON.parse(responseText);
        return respBody;
    }
    async checkLogoUpload(suffix: string, upload = true): Promise<void> {
        const responseData = await this.getResponseData(suffix, 200);
        if (upload) {
            expect(responseData.data.logoKey).not.toBeNull();
        } else {
            expect(responseData.data.logoKey).toBeNull();
        }
    }
    async loginToCpAdmin(): Promise<void> {
        const loginPage = new LoginPage(this.page);
        await this.page.goto(`${process.env.NEXT_PUBLIC_CP_FRONTEND_URL}/home`);
        await super.clickElement(loginPage.loginIcon);
        await loginPage.login(TestData.USER.ADMIN_USER_EMAIL);
    }
    async getTokenFromHeaders(url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`): Promise<string> {
        const request = await this.page.waitForRequest(`${url}/me`);
        return request.headers()['authorization'];
    }
}
