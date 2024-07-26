"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const post_routes_1 = __importDefault(require("../modules/post/post.routes"));
const upload_routes_1 = __importDefault(require("../modules/upload/upload.routes"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.status(200).send({
        status: true
    });
});
router.use('/auth', auth_routes_1.default);
router.use('/post', post_routes_1.default);
router.use('/upload', upload_routes_1.default);
exports.default = router;
