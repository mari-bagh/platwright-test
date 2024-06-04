import { Chance } from 'chance';
const chance = new Chance();
export default class TestData {
    static readonly MESSAGES = {
        SUBSPACE_SERVICE_DISABLEMENT: (serviceName: string) =>
            `Turning off the ${serviceName} service will only affect this space. \n
            To turn off the service for child subspaces, please select them below. Pending requests will be fulfilled.`,
        SUBSPACE_SERVICE_ENABLEMENT: (serviceName: string) =>
            `Turning on the ${serviceName} service on this space will turn it on for the following subspaces. Please make sure to review.`,
        SUCCESSFULLY_TRANSFERRED: 'You have successfully transferred ownership.',
        SPACE_LENGTH_MESSAGE: 'Name length must be at least 3 characters long.',
        SUCCESSFULLY_PAYED: 'Your payment has been successfully processed.',
        WORKSPACE_UPDATED: 'Workspace data has been successfully updated.',
        PAYMENT_UPDATED: 'Payment method has been successfully updated.',
        WORKSPACE_CREATED: 'Organization has been successfully created',
        SUBSPACE_CREATED: 'Sub space has been successfully created',
        SPACE_UPDATED: 'Space data has been successfully updated.',
        CANCEL_INVITATION: 'User has been successfully deleted',
        SPACE_CREATED: 'Space has been successfully created',
        SPACE_DELETED: 'Space has been deleted successfully',
        MEMBER_DELETED: 'User has been successfully deleted',
        ROLE_DELETED: 'Role has been deleted successfully.',
        WRONG_EMAIL_OR_PASS: 'Wrong email or password',
        SPACE_NAME_UNIQUENESS: 'Name must be unique.',
        INVALID_PASSWORD: 'The password is too weak',
        MEMBER_ADDED: 'Member successfully added',
        PAYMENT_ADDED: 'Card successfully added.',
        REQUIRED_FIELD: 'This field is required',
        ROLE_CREATED: 'Role has been created.',
        INVALID_EMAIL: 'Email is not valid.',
        ROLE_EDITED: 'Role has been edited.',
        INVITE_SENT: 'Invite sent',
        SERVICE_ENABLED: ''
    };
    static readonly USER = {
        VALID_GUERRILLA_EMAIL_EXAMPLE: `${chance.first().toLowerCase()}-test${chance.age()}@sharklasers.com`,
        VALID_EMAIL_EXAMPLE: `test-${chance.first().toLowerCase()}-${chance.age()}@testing.qa`,
        INVALID_EMAIL: chance.first() + chance.age() + 'mail.com',
        INVALID_PASSWORD: `${chance.integer()}Testing1234`,
        TRANSFER_OWNERSHIP_USER_2: 'to_user2@testing.qa',
        GOOGLE_ACCOUNT: 'sorenson.testing123@gmail.com',
        RANDOM_SENTENCE: chance.sentence({ words: 5 }),
        TRANSFER_OWNERSHIP_USER: 'to-user@testing.qa',
        ADMIN_USER_EMAIL: 'admin-user@testing.qa',
        INVALID_EMAIL_FORMAT: '@example.com',
        TEST_USER_2: 'floyd-p@testing.qa',
        VALID_EMAIL: 'janny-o@testing.qa',
        TEST_USER_4: 'janny-o@testing.qa',
        TEST_USER_1: 'nina-p@testing.qa',
        TEST_USER_3: 'adams@testing.qa',
        INVALID_PASSWORD_FORMAT: 'abcd',
        TEST_USER: 'sarah-j@testing.qa',
        VALID_PASSWORD: 'Testing1234',
        ADMIN_USER_PASS: '123456Ss!',
        FIRST_NAME: chance.first()
    };
    static readonly WORKSPACE = {
        RANDOM_SUBSPACE_NAME: `Subspace-${chance.age()}${chance.province()}`,
        RANDOM_SPACE_NAME: `Space-${chance.age()}${chance.province()}`,
        RANDOM_ROLE_NAME: `${chance.age()}-${chance.province()}`,
        RANDOM_WORKSPACE_NAME: chance.company() + chance.age(),
        CARD_WITHOUT_BALANCE: '4000000000000341',
        CARD_EXAMPLE_1: '4242424242424242',
        CARD_EXAMPLE_2: '5454545454545454'
    };
    static readonly STATE = {
        STORAGE_STATE: `./tests/states/authState-${Math.floor(Math.random() * 5000)}.json`,
        RANDOM_NUMBER: Date.now()
    };
}
