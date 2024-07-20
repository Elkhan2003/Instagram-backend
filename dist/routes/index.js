"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const post_routes_1 = __importDefault(require("../modules/post/post.routes"));
const upload_routes_1 = __importDefault(require("../modules/upload/upload.routes"));
const router = (0, express_1.Router)();
router.get('/', (0, cors_1.default)(), (req, res) => {
    res.status(200).send({
        status: true
    });
});
router.use('/auth', (0, cors_1.default)(), auth_routes_1.default);
router.use('/post', (0, cors_1.default)(), post_routes_1.default);
router.use('/upload', (0, cors_1.default)(), upload_routes_1.default);
exports.default = router;
