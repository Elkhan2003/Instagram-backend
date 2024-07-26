"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }
    const accessToken = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ message: 'Токен недействителен или истек' });
    }
};
exports.default = authenticateToken;
