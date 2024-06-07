"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const emitter = new events_1.default.EventEmitter();
const data = [];
const getFeedback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при получении данных'
        });
    }
};
const getFeedbackLongPolling = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        emitter.once('feedback', (feedback) => {
            res.status(200).send({
                success: true,
                results: feedback
            });
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при получении данных'
        });
    }
};
const sendFeedback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({
                message: 'The user is not authenticated.'
            });
        }
        data.push({
            id: Date.now(),
            user: {
                firstName: user?.firstName,
                lastName: user?.lastName,
                photo: user?.photo
            },
            text: req.body.text
        });
        emitter.emit('feedback', data);
        res.status(200).send({
            success: true,
            results: data
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            results: 'Произошла ошибка при отправке данных'
        });
    }
};
exports.default = { getFeedback, getFeedbackLongPolling, sendFeedback };
