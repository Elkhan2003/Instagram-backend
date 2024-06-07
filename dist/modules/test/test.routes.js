"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const test_controller_1 = __importDefault(require("./test.controller"));
const router = (0, express_1.Router)();
router.get('/get', test_controller_1.default.getUser);
router.get('/get/:url/:resource', test_controller_1.default.getUserParams);
router.post('/post/ddos/:url', test_controller_1.default.limiterUserRequests);
exports.default = router;
