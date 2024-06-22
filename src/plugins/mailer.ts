import nodemailer, { Transporter } from 'nodemailer';

interface MailOptions {
	from: string;
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

const emailConfig = {
	service: 'gmail',
	user: process.env.EMAIL_USER!,
	pass: process.env.EMAIL_PASS!
};

class MailerPlugin {
	private transporter: Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			service: emailConfig.service,
			auth: {
				user: emailConfig.user,
				pass: emailConfig.pass
			}
		});
	}

	async sendMail(options: MailOptions): Promise<string> {
		const mailOptions = {
			from: options.from,
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html
		};

		try {
			const info = await this.transporter.sendMail(mailOptions);
			return info.response;
		} catch (error) {
			throw error;
		}
	}
}

export const mailer = new MailerPlugin();
