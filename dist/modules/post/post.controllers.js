"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment/moment"));
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
        const data = await prisma_1.prisma.post.findMany({
            where: { userId: req.user?.id }
        });
        res.status(200).send(data);
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
const getLikePost = async (req, res) => {
    const { postId } = req.params;
    const postIdNumber = Number(postId);
    try {
        const [postExists, likesCount, userLike] = await Promise.all([
            prisma_1.prisma.post.findUnique({ where: { id: postIdNumber } }),
            prisma_1.prisma.like.count({ where: { postId: postIdNumber } }),
            prisma_1.prisma.like.findFirst({
                where: { userId: req.user?.id, postId: postIdNumber }
            })
        ]);
        if (!postExists) {
            return res.status(404).send({ message: 'Пост не найден' });
        }
        const isLike = !!userLike;
        res.status(200).send({ postId: postIdNumber, likesCount, isLike });
    }
    catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
const likePost = async (req, res) => {
    const { postId } = req.body;
    const postIdNumber = Number(postId);
    try {
        const existingLike = await prisma_1.prisma.like.findFirst({
            where: {
                userId: req.user?.id,
                postId: postIdNumber
            }
        });
        if (existingLike) {
            return res
                .status(400)
                .send({ message: 'Пользователь уже поставил лайк этому посту' });
        }
        const like = {
            userId: req.user?.id,
            postId: postIdNumber,
            createdAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
            updatedAt: (0, moment_1.default)().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
        };
        res.status(200).send(like);
        await prisma_1.prisma.like.create({
            data: like
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Внутренняя ошибка сервера' });
    }
};
const unLikePost = async (req, res) => {
    const { postId } = req.body;
    const postIdNumber = Number(postId);
    try {
        const existingLike = await prisma_1.prisma.like.findFirst({
            where: {
                userId: req.user?.id,
                postId: postIdNumber
            }
        });
        if (!existingLike) {
            return res.status(404).send({ message: 'Лайк не найден' });
        }
        const like = {
            userId: req.user?.id,
            postId: postIdNumber
        };
        res.status(200).send(like);
        await prisma_1.prisma.like.delete({
            where: {
                userId_postId: like
            }
        });
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
    getLikePost,
    likePost,
    unLikePost,
    deletePost
};
