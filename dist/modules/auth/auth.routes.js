"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("./auth.controllers"));
const router = (0, express_1.Router)();
router.post('/sign-in', auth_controllers_1.default.loginUser);
router.post('/sign-up', auth_controllers_1.default.registrationUser);
router.get('/user', auth_controllers_1.default.authenticateToken, auth_controllers_1.default.getUser);
exports.default = router;
