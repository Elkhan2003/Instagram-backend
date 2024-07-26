"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = __importDefault(require("../../middleware/authenticateToken"));
const auth_controllers_1 = __importDefault(require("./auth.controllers"));
const router = (0, express_1.Router)();
router.post('/sign-in', auth_controllers_1.default.loginUser);
router.post('/sign-up', auth_controllers_1.default.registerUser);
router.post('/logout', auth_controllers_1.default.logoutUser);
router.patch('/refresh', auth_controllers_1.default.refreshToken);
router.post('/forgot', auth_controllers_1.default.forgotPassword);
router.patch('/reset-password', auth_controllers_1.default.resetPassword);
router.get('/user', authenticateToken_1.default, auth_controllers_1.default.getUser);
exports.default = router;
