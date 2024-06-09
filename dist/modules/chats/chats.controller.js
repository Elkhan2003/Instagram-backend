"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const generateRandomId = () => {
    const randomBytes = crypto_1.default.randomBytes(8);
    return parseInt(randomBytes.toString('hex'), 16).toString();
};
const getUser = async (ws) => {
    const results = generateRandomId();
    ws.send(JSON.stringify({
        success: true,
        results
    }));
};
exports.default = { getUser };
