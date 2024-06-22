"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailer = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailConfig = {
    service: 'gmail',
    user: 'boss.armsport@gmail.com',
    pass: 'qbiz ltgj fjox rupp'
};
class MailerPlugin {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: emailConfig.service,
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            }
        });
    }
    async sendMail(options) {
        const mailOptions = {
            from: emailConfig.user,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info.response;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.mailer = new MailerPlugin();
