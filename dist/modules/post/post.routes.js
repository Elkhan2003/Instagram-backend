"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controllers_1 = __importDefault(require("../auth/auth.controllers"));
const post_controllers_1 = __importDefault(require("./post.controllers"));
const router = (0, express_1.Router)();
router.get('/get-all', post_controllers_1.default.getPosts);
router.get('/get-my', auth_controllers_1.default.authenticateToken, post_controllers_1.default.getMePosts);
router.get('/get-other/:id', auth_controllers_1.default.authenticateToken, post_controllers_1.default.getOtherPosts);
router.post('/create', auth_controllers_1.default.authenticateToken, post_controllers_1.default.createPost);
router.get('/get-like/:postId', auth_controllers_1.default.authenticateToken, post_controllers_1.default.getLikePost);
router.post('/like', auth_controllers_1.default.authenticateToken, post_controllers_1.default.likePost);
router.delete('/unlike', auth_controllers_1.default.authenticateToken, post_controllers_1.default.unLikePost);
router.delete('/delete/:id', auth_controllers_1.default.authenticateToken, post_controllers_1.default.deletePost);
exports.default = router;
