"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = __importDefault(require("../../middleware/authenticateToken"));
const post_controllers_1 = __importDefault(require("./post.controllers"));
const router = (0, express_1.Router)();
router.get('/get-all', post_controllers_1.default.getPosts);
router.get('/get-my', authenticateToken_1.default, post_controllers_1.default.getMePosts);
router.get('/get-other/:id', authenticateToken_1.default, post_controllers_1.default.getOtherPosts);
router.post('/create', authenticateToken_1.default, post_controllers_1.default.createPost);
router.get('/get-like/:postId', authenticateToken_1.default, post_controllers_1.default.getLikePost);
router.post('/like', authenticateToken_1.default, post_controllers_1.default.likePost);
router.delete('/unlike', authenticateToken_1.default, post_controllers_1.default.unLikePost);
router.delete('/delete/:id', authenticateToken_1.default, post_controllers_1.default.deletePost);
exports.default = router;
