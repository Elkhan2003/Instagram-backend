"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controller_1 = __importDefault(require("./feedback.controller"));
const router = (0, express_1.Router)();
router.get('/get', feedback_controller_1.default.getFeedback);
router.get('/get-long-polling', feedback_controller_1.default.getFeedbackLongPolling);
router.post('/send', feedback_controller_1.default.sendFeedback);
exports.default = router;
