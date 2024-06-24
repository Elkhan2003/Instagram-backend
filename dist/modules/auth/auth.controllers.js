"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../plugins/prisma");
const redis_1 = require("../../plugins/redis");
const mailer_1 = require("../../plugins/mailer");
const constants_1 = require("../../constants");
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1m'
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '15d'
    });
    return { accessToken, refreshToken };
};
const registerUser = async (req, res) => {
    const { email, password, userName, photo } = req.body;
    const { fingerprint } = req;
    if (!email || !password || !userName || !photo) {
        return res.status(400).send({
            message: 'Все поля обязательны для заполнения',
            hint: {
                email: 'string',
                password: 'string',
                userName: 'string',
                photo: 'string'
            }
        });
    }
    if (email.length < 2 ||
        password.length < 2 ||
        userName.length < 2 ||
        photo.length < 2) {
        return res.status(400).send({
            message: 'Все поля должны содержать минимум 2 символа',
            hint: {
                email: 'минимум 2 символа',
                password: 'минимум 2 символа',
                userName: 'минимум 2 символа',
                photo: 'минимум 2 символа'
            }
        });
    }
    const emailRegex = /^\S+@\S+\.\S+$/i;
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            message: 'Неверный формат email',
            hint: {
                email: 'Введите корректный email адрес'
            }
        });
    }
    try {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res
                .status(409)
                .send({ message: 'Пользователь уже зарегистрирован' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const { id } = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                userName,
                photo,
                createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        const payload = { id, email, userName, photo };
        const { accessToken, refreshToken } = generateTokens(payload);
        await prisma_1.prisma.refreshSession.create({
            data: {
                userId: id,
                refreshToken,
                fingerPrint: fingerprint?.hash,
                createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        res.status(201).send({
            message: 'Пользователь успешно зарегистрировался',
            accessToken,
            accessTokenExpiration: constants_1.ACCESS_TOKEN_EXPIRATION,
            refreshToken
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const { fingerprint } = req;
    if (!email || !password) {
        return res.status(400).send({
            message: 'Все поля обязательны для заполнения',
            hint: {
                email: 'string',
                password: 'string'
            }
        });
    }
    const emailRegex = /^\S+@\S+\.\S+$/i;
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            message: 'Неверный формат email',
            hint: {
                email: 'Введите корректный email адрес'
            }
        });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: 'Неверный логин или пароль' });
        }
        const existingSession = await prisma_1.prisma.refreshSession.findFirst({
            where: { userId: user.id, fingerPrint: fingerprint?.hash }
        });
        const payload = {
            id: user.id,
            email,
            userName: user.userName,
            photo: user.photo
        };
        const { accessToken, refreshToken } = generateTokens(payload);
        if (existingSession) {
            await prisma_1.prisma.refreshSession.update({
                where: { id: existingSession.id },
                data: {
                    refreshToken,
                    updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
                }
            });
        }
        else {
            await prisma_1.prisma.refreshSession.create({
                data: {
                    userId: user.id,
                    refreshToken,
                    fingerPrint: fingerprint?.hash,
                    createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                    updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
                }
            });
        }
        res.status(200).send({
            accessToken,
            accessTokenExpiration: constants_1.ACCESS_TOKEN_EXPIRATION,
            refreshToken,
            fingerprint: fingerprint?.components
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const logoutUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        await prisma_1.prisma.refreshSession.deleteMany({
            where: { refreshToken }
        });
        res.status(200).send({ message: 'Пользователь успешно вышел из системы' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const refreshToken = async (req, res) => {
    const { refreshToken: tokenFromBody } = req.body;
    const { fingerprint } = req;
    console.log(tokenFromBody);
    if (!tokenFromBody) {
        return res.status(401).send({ message: 'Refresh token не предоставлен' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(tokenFromBody, process.env.REFRESH_TOKEN_SECRET);
        const existingSession = await prisma_1.prisma.refreshSession.findFirst({
            where: { refreshToken: tokenFromBody }
        });
        if (!existingSession) {
            return res
                .status(401)
                .send({ message: 'Недействительный refresh token' });
        }
        if (existingSession.fingerPrint !== fingerprint?.hash) {
            return res.status(401).send({ message: 'Недействительный fingerprint' });
        }
        const newPayload = {
            id: payload.id,
            email: payload.email,
            userName: payload.userName,
            photo: payload.photo
        };
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(newPayload);
        await prisma_1.prisma.refreshSession.update({
            where: { id: existingSession.id },
            data: {
                refreshToken: newRefreshToken,
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        res.status(200).send({
            accessToken,
            accessTokenExpiration: constants_1.ACCESS_TOKEN_EXPIRATION,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const forgotPassword = async (req, res) => {
    const { frontEndUrl, email } = req.body;
    if (!email) {
        return res.status(400).send({
            message: 'Все поля обязательны для заполнения',
            hint: {
                email: 'string'
            }
        });
    }
    const emailRegex = /^\S+@\S+\.\S+$/i;
    if (!emailRegex.test(email)) {
        return res.status(400).send({
            message: 'Неверный формат email',
            hint: {
                email: 'Введите корректный email адрес'
            }
        });
    }
    // Регулярное выражение для проверки допустимого домена
    const domainRegex = /^https?:\/\/[^\/]+/;
    const matchedDomain = frontEndUrl.match(domainRegex);
    if (!matchedDomain) {
        return res.status(400).send({
            message: 'Недопустимый домен',
            hint: {
                frontEndUrl: 'Введите корректный URL с допустимым доменом'
            }
        });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: 'Пользователь не найден' });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.RESET_PASSWORD_TOKEN_SECRET, {
            expiresIn: '15m'
        });
        await redis_1.redis.setData(`resetToken:${user.id}`, resetToken, 15 * 60);
        const resetPasswordHtml = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <table align="center" width="600" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #ddd; margin: 0 auto;">
                    <tr>
                        <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
                            <h1 style="color: #9336fd;">Сброс пароля аккаунта</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 20px;">
                            <p style="font-size: 18px; margin: 0;">Здравствуйте,</p>
                            <p style="font-size: 16px; margin: 10px 0;">Мы получили запрос на сброс пароля для вашего аккаунта.</p>
                            <p style="font-size: 16px; margin: 10px 0;">Нажмите кнопку ниже, чтобы сбросить пароль:</p>
                            <a href="${matchedDomain[0]}/auth/reset-password?token=${resetToken}" style="background-color: #9336fd; color: #ffffff; padding: 15px 20px; text-decoration: none; font-size: 16px; border-radius: 5px; display: inline-block;">Сбросить пароль</a>
                            <p style="font-size: 16px; margin: 10px 0;">Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь со службой поддержки.</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
                            <p style="font-size: 14px; margin: 0;">Спасибо,<br>Команда ElchoDev</p>
                            <p style="font-size: 14px; margin: 0;">Нужна помощь? Свяжитесь с нами по адресу <a href="mailto:boss.armsport@gmail.com">boss.armsport@gmail.com</a></p>
                        </td>
                    </tr>
                </table>
            </div>
        `;
        const resetPasswordText = `
Hello,

We received a request to reset your account password.
Click the link below to reset your password:
${matchedDomain[0]}/auth/reset-password?token=${resetToken}

If you did not request a password reset, please ignore this email or contact support.

Thank you,
The ElchoDev Team

Need help? Contact us at boss.armsport@gmail.com
`;
        const mailOptions = {
            from: '"ElchoDev" <boss.armsport@gmail.com>',
            to: email,
            subject: 'Reset your password',
            text: resetPasswordText,
            html: resetPasswordHtml
        };
        await mailer_1.mailer.sendMail(mailOptions);
        res.status(200).send({ message: 'Password reset email sent successfully' });
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).send({
            message: 'Все поля обязательны для заполнения',
            hint: {
                newPassword: 'string'
            }
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET);
        const { id } = decoded;
        const storedToken = await redis_1.redis.getData(`resetToken:${id}`);
        if (!storedToken || storedToken !== token) {
            return res
                .status(400)
                .send({ message: 'Неверный или просроченный токен сброса пароля' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.prisma.user.update({
            where: { id },
            data: {
                password: hashedPassword,
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        await redis_1.redis.deleteData(`resetToken:${id}`);
        res.status(200).send({ message: 'Пароль успешно сброшен' });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res
                .status(400)
                .send({ message: 'Неверный или просроченный токен сброса пароля' });
        }
        res.status(500).send({ message: 'Internal server error' });
    }
};
const getUser = async (req, res) => {
    const data = await prisma_1.prisma.user.findUnique({
        where: { email: req.user?.email }
    });
    if (!data) {
        return res
            .status(404)
            .json({ message: 'Пользователь не прошел проверку подлинности' });
    }
    const userData = {
        id: data.id,
        userName: data.userName,
        role: data.role,
        email: data.email,
        isActive: data.isActive,
        photo: data.photo,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
    res.status(200).send({ profile: userData });
};
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }
    const accessToken = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        // @ts-ignore
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ message: 'Invalid access token' });
    }
};
exports.default = {
    loginUser,
    registerUser,
    logoutUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    getUser,
    authenticateToken
};
