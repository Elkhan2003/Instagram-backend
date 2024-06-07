"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trash_controller_1 = __importDefault(require("./trash.controller"));
const router = (0, express_1.Router)();
router.get('/get', trash_controller_1.default.getUser);
router.get('/get/:url/:resource', trash_controller_1.default.getUserParams);
router.post('/post/ddos/:url', trash_controller_1.default.limiterUserRequests);
exports.default = router;
