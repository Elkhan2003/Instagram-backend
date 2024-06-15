"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../plugins/prisma");
const moment_1 = __importDefault(require("moment"));
const SECRET_KEY = 'Elcho911';
const registrationUser = async (req, res) => {
    const { login, password, userName, photo } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    await prisma_1.prisma.user.create({
        data: {
            login: login,
            password: hashedPassword,
            userName: userName,
            photo: photo,
            createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        }
    });
    res.status(201).send({ message: 'User registered successfully' });
};
const loginUser = async (req, res) => {
    const { login, password } = req.body;
    const data = await prisma_1.prisma.user.findUnique({
        where: { login: login }
    });
    if (!data) {
        return res.status(400).json({ message: 'Invalid login or password' });
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, data.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid login or password' });
    }
    const token = jsonwebtoken_1.default.sign({ login: data.login }, SECRET_KEY, {
        expiresIn: '1h'
    });
    res.status(200).send({ token });
};
const getUser = async (req, res) => {
    const data = await prisma_1.prisma.user.findUnique({
        where: { login: req.user?.login }
    });
    if (!data) {
        return res.status(404).json({ message: 'The user is not authenticated.' });
    }
    res.status(200).send({ profile: data });
};
// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        // @ts-ignore
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
exports.default = {
    loginUser,
    registrationUser,
    getUser,
    authenticateToken
};
