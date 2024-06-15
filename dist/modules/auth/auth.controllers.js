"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = 'Elcho911';
let users = [];
const registrationUser = async (req, res) => {
    const { login, password, photo } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = { login, password: hashedPassword, photo };
    users.push(user);
    res.status(201).send({ message: 'User registered successfully' });
};
const loginUser = async (req, res) => {
    const { login, password } = req.body;
    const user = users.find((u) => u.login === login);
    if (!user) {
        return res.status(400).json({ message: 'Invalid login or password' });
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid login or password' });
    }
    const token = jsonwebtoken_1.default.sign({ login: user.login }, SECRET_KEY, {
        expiresIn: '1h'
    });
    res.status(200).send({ token });
};
const getUser = async (req, res) => {
    const user = users.find((u) => u.login === req.user?.login);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).send({ profile: user });
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
