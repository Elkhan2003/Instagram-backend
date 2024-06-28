"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controllers_1 = __importDefault(require("./upload.controllers"));
const multer_1 = require("../../plugins/multer");
const router = (0, express_1.Router)();
router.post('/photo', multer_1.upload.single('avatar'), upload_controllers_1.default.uploadPhoto);
exports.default = router;
