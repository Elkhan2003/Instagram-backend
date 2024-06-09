"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chats_controller_1 = __importDefault(require("./chats.controller"));
const router = (0, express_1.Router)();
router.get('/get', chats_controller_1.default.getUser);
exports.default = router;
