"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../plugins/prisma");
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
    const { login, password, userName, photo } = req.body;
    const { fingerprint } = req;
    if (!login || !password || !userName || !photo) {
        return res.status(400).send({
            message: 'Все поля обязательны для заполнения',
            hint: {
                login: 'string',
                password: 'string',
                userName: 'string',
                photo: 'string'
            }
        });
    }
    if (login.length < 2 ||
        password.length < 2 ||
        userName.length < 2 ||
        photo.length < 2) {
        return res.status(400).send({
            message: 'Все поля должны содержать минимум 2 символа',
            hint: {
                login: 'минимум 2 символа',
                password: 'минимум 2 символа',
                userName: 'минимум 2 символа',
                photo: 'минимум 2 символа'
            }
        });
    }
    try {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { login } });
        if (existingUser) {
            return res
                .status(409)
                .send({ message: 'Пользователь уже зарегистрирован' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const { id } = await prisma_1.prisma.user.create({
            data: {
                login,
                password: hashedPassword,
                userName,
                photo,
                createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        const payload = { id, login, userName, photo };
        const { accessToken, refreshToken } = generateTokens(payload);
        await prisma_1.prisma.refreshSession.create({
            data: {
                userId: id,
                refreshToken,
                fingerPrint: fingerprint?.hash
            }
        });
        res.cookie('refreshToken', refreshToken, constants_1.COOKIE_SETTINGS.REFRESH_TOKEN);
        res.status(201).send({
            message: 'Пользователь успешно зарегистрировался',
            accessToken,
            accessTokenExpiration: constants_1.ACCESS_TOKEN_EXPIRATION
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const loginUser = async (req, res) => {
    const { login, password } = req.body;
    const { fingerprint } = req;
    if (!login || !password) {
        return res.status(400).send({
            message: 'Все поля обязательны для заполнения',
            hint: {
                login: 'string',
                password: 'string'
            }
        });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { login } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: 'Неверный логин или пароль' });
        }
        const payload = {
            id: user.id,
            login,
            userName: user.userName,
            photo: user.photo
        };
        const { accessToken, refreshToken } = generateTokens(payload);
        await prisma_1.prisma.refreshSession.create({
            data: {
                userId: user.id,
                refreshToken,
                fingerPrint: fingerprint?.hash
            }
        });
        res.cookie('refreshToken', refreshToken, constants_1.COOKIE_SETTINGS.REFRESH_TOKEN);
        res.status(200).send({
            accessToken,
            accessTokenExpiration: constants_1.ACCESS_TOKEN_EXPIRATION
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
        res.clearCookie('refreshToken');
        res.status(200).send({ message: 'Пользователь успешно вышел из системы' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const refreshToken = async (req, res) => {
    const { refreshToken: tokenFromCookie } = req.cookies;
    const { fingerprint } = req;
    console.log(tokenFromCookie);
    if (!tokenFromCookie) {
        return res.status(401).send({ message: 'Refresh token не предоставлен' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(tokenFromCookie, process.env.REFRESH_TOKEN_SECRET);
        const existingSession = await prisma_1.prisma.refreshSession.findFirst({
            where: { refreshToken: tokenFromCookie }
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
            login: payload.login,
            userName: payload.userName,
            photo: payload.photo
        };
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(newPayload);
        await prisma_1.prisma.refreshSession.update({
            where: { id: existingSession.id },
            data: { refreshToken: newRefreshToken }
        });
        res.cookie('refreshToken', newRefreshToken, constants_1.COOKIE_SETTINGS.REFRESH_TOKEN);
        res
            .status(200)
            .send({ accessToken, accessTokenExpiration: constants_1.ACCESS_TOKEN_EXPIRATION });
    }
    catch (error) {
        // if (error instanceof jwt.TokenExpiredError) {
        // 	return res.status(401).send({ message: 'Refresh token истек' });
        // }
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
const getUser = async (req, res) => {
    const data = await prisma_1.prisma.user.findUnique({
        where: { login: req.user?.login }
    });
    if (!data) {
        return res
            .status(404)
            .json({ message: 'Пользователь не прошел проверку подлинности' });
    }
    res.status(200).send({ profile: data });
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
    getUser,
    authenticateToken
};
