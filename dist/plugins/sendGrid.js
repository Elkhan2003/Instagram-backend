"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailPlugin = void 0;
// @ts-ignore
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
class TransactionalEmailPlugin {
    apiInstance;
    constructor() {
        const defaultClient = sib_api_v3_sdk_1.default.ApiClient.instance;
        const apiKeyAuth = defaultClient.authentications['api-key'];
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            throw new Error('API key is not defined in .env file');
        }
        apiKeyAuth.apiKey = apiKey;
        this.apiInstance = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
    }
    async sendEmail(settings) {
        const sendSmtpEmail = new sib_api_v3_sdk_1.default.SendSmtpEmail();
        sendSmtpEmail.subject = settings.subject;
        sendSmtpEmail.sender = {
            name: settings.senderName,
            email: settings.senderEmail
        };
        sendSmtpEmail.to = [{ email: settings.to }];
        sendSmtpEmail.htmlContent = settings.htmlContent;
        try {
            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('Email sent successfully. Returned data: ' + data);
        }
        catch (error) {
            console.error(error);
        }
    }
}
// Usage example
exports.emailPlugin = new TransactionalEmailPlugin();
const emailSettings = {
    to: 'boss.armsport@gmail.com',
    subject: 'Password Reset',
    senderName: 'Your Company',
    senderEmail: 'no-reply@yourcompany.com',
    htmlContent: '<p>Click <a href="https://yourcompany.com/reset-password?token=YOUR_TOKEN">here</a> to reset your password.</p>'
};
(async () => {
    await exports.emailPlugin.sendEmail(emailSettings);
})();
