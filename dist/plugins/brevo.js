"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class EmailCampaignPlugin {
    apiInstance;
    constructor() {
        const defaultClient = sib_api_v3_sdk_1.default.ApiClient.instance;
        const apiKeyAuth = defaultClient.authentications['api-key'];
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            throw new Error('API key is not defined in .env file');
        }
        apiKeyAuth.apiKey = apiKey;
        this.apiInstance = new sib_api_v3_sdk_1.default.EmailCampaignsApi();
    }
    async createCampaign(settings) {
        const emailCampaign = new sib_api_v3_sdk_1.default.CreateEmailCampaign();
        // Define the campaign settings
        emailCampaign.name = settings.name;
        emailCampaign.subject = settings.subject;
        emailCampaign.sender = {
            name: settings.senderName,
            email: settings.senderEmail
        };
        emailCampaign.type = 'classic';
        emailCampaign.htmlContent = settings.htmlContent;
        emailCampaign.recipients = { listIds: settings.listIds };
        emailCampaign.scheduledAt = settings.scheduledAt;
        // Make the call to the client
        try {
            console.log('Sending email campaign');
            const data = await this.apiInstance.createEmailCampaign(emailCampaign);
            console.log('API called successfully. Returned data: ' + data);
        }
        catch (error) {
            console.error(error);
        }
    }
}
// Usage example
const emailCampaignPlugin = new EmailCampaignPlugin();
const campaignSettings = {
    name: 'Campaign sent via the API',
    subject: 'My subject',
    senderName: 'Elkhan',
    senderEmail: 'myfromemail@mycompany.com',
    htmlContent: 'Congratulations! You successfully sent this example campaign via the Brevo API.',
    listIds: [2, 7],
    scheduledAt: '2018-01-01 00:00:01'
};
(async () => {
    await emailCampaignPlugin.createCampaign(campaignSettings);
})();
