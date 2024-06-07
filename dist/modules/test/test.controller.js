"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const getUser = async (req, res) => {
    const generateRandomId = () => {
        const randomBytes = crypto_1.default.randomBytes(8);
        const randomId = parseInt(randomBytes.toString('hex'), 16).toString();
        return randomId;
    };
    res.status(200).send({
        success: true,
        results: generateRandomId()
    });
};
const getUserParams = async (req, res) => {
    const generateRandomId = () => {
        const randomBytes = crypto_1.default.randomBytes(16);
        const randomId = randomBytes.toString('hex');
        return {
            url: req.params.url || 'unknown',
            resource: req.params.resource || 'unknown',
            randomId
        };
    };
    res.status(200).send({
        success: true,
        results: generateRandomId()
    });
};
const userRequestCounts = new Map();
const maxRequestsPerSecond = 5;
const userRequestCountsDelete = 1000 * 3;
const limiterUserRequests = async (req, res) => {
    try {
        const paramsUrl = req.params.url;
        let setTimeoutId = setTimeout(() => {
            userRequestCounts.delete(paramsUrl);
        }, userRequestCountsDelete);
        if (!userRequestCounts.has(paramsUrl)) {
            userRequestCounts.set(paramsUrl, 1);
        }
        else {
            const count = userRequestCounts.get(paramsUrl) + 1;
            userRequestCounts.set(paramsUrl, count);
            clearTimeout(setTimeoutId);
            if (count > maxRequestsPerSecond) {
                return res.status(429).send({
                    success: false,
                    results: 'Превышен лимит запросов для пользователя'
                });
            }
        }
        res.status(200).send({
            success: true,
            results: 'Работаю!'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            error: 'Произошла ошибка при создании таблицы',
            message: error.message || 'Неопределенная ошибка'
        });
    }
};
exports.default = { getUser, getUserParams, limiterUserRequests };
