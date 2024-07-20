"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const prisma_1 = require("../../plugins/prisma");
const getPosts = async (req, res) => {
    try {
        const data = await prisma_1.prisma.post.findMany();
        res.status(200).send(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
const getMePosts = async (req, res) => {
    try {
        // const userData = await prisma.user.findFirst({
        // 	where: { email: req.user?.email }
        // });
        // if (!userData) {
        // 	return res
        // 		.status(404)
        // 		.send({ message: 'Пользователь не прошел проверку подлинности' });
        // }
        const data = await prisma_1.prisma.post.findMany({
            where: { userId: req.user?.id }
        });
        res.status(200).send({ test: req.user, data });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
const getOtherPosts = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await prisma_1.prisma.post.findMany({ where: { userId: Number(id) } });
        res.status(200).send(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
const createPost = async (req, res) => {
    const { caption, mediaUrl, mediaType } = req.body;
    const userData = await prisma_1.prisma.user.findFirst({
        where: { email: req.user?.email }
    });
    if (!userData) {
        return res
            .status(404)
            .send({ message: 'Пользователь не прошел проверку подлинности' });
    }
    if (!userData.id || !mediaUrl || !mediaType) {
        return res.status(400).send({ message: 'Необходимые данные отсутствуют' });
    }
    if (!['PHOTO', 'VIDEO'].includes(mediaType)) {
        return res.status(400).send({ message: 'Неверный тип медиа' });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userData.id } });
        if (!user) {
            return res.status(404).send({ message: 'Пользователь не найден' });
        }
        const data = await prisma_1.prisma.post.create({
            data: {
                userId: userData.id,
                caption,
                mediaUrl,
                mediaType,
                createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
                updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
            }
        });
        res.status(201).send(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
const deletePost = async (req, res) => {
    const { id: postParamsId } = req.params;
    const postId = Number(postParamsId);
    if (!postId) {
        return res.status(400).send({ message: 'Идентификатор поста отсутствует' });
    }
    const user = await prisma_1.prisma.user.findFirst({
        where: { email: req.user?.email }
    });
    if (!user) {
        return res.status(404).send({ message: 'Пользователь не авторизован!' });
    }
    try {
        const post = await prisma_1.prisma.post.findFirst({
            where: { id: postId }
        });
        if (!post) {
            return res.status(404).send({ message: 'Пост не найден' });
        }
        if (post.userId !== user.id) {
            return res
                .status(403)
                .send({ message: 'У вас нет прав для удаления этого поста' });
        }
        await prisma_1.prisma.post.delete({
            where: { id: postId }
        });
        res.status(200).send({ message: 'Пост успешно удален' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
exports.default = {
    getPosts,
    getMePosts,
    getOtherPosts,
    createPost,
    deletePost
};
