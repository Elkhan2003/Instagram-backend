import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import { prisma } from '../../plugins/prisma';

const getPosts = async (req: Request, res: Response) => {
	try {
		const data = await prisma.post.findMany();
		res.status(200).send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const getMePosts = async (req: Request, res: Response) => {
	try {
		const userData = await prisma.user.findFirst({
			where: { email: req.user?.email }
		});
		if (!userData) {
			return res
				.status(404)
				.send({ message: 'Пользователь не прошел проверку подлинности' });
		}
		const data = await prisma.post.findMany({ where: { userId: userData.id } });
		res.status(200).send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const getOtherPosts = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const data = await prisma.post.findMany({ where: { userId: Number(id) } });
		res.status(200).send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const createPost = async (req: Request, res: Response) => {
	const { caption, mediaUrl, mediaType } = req.body;
	const userData = await prisma.user.findFirst({
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
		const user = await prisma.user.findUnique({ where: { id: userData.id } });
		if (!user) {
			return res.status(404).send({ message: 'Пользователь не найден' });
		}
		const data = await prisma.post.create({
			data: {
				userId: userData.id,
				caption,
				mediaUrl,
				mediaType,
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});
		res.status(201).send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const deletePost = async (
	req: Request<{
		id: string;
	}>,
	res: Response
) => {
	const { id: postParamsId } = req.params;
	const postId = Number(postParamsId);
	if (!postId) {
		return res.status(400).send({ message: 'Идентификатор поста отсутствует' });
	}
	const user = await prisma.user.findFirst({
		where: { email: req.user?.email }
	});
	if (!user) {
		return res.status(404).send({ message: 'Пользователь не авторизован!' });
	}
	try {
		const post = await prisma.post.findFirst({
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
		await prisma.post.delete({
			where: { id: postId }
		});
		res.status(200).send({ message: 'Пост успешно удален' });
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

export default {
	getPosts,
	getMePosts,
	getOtherPosts,
	createPost,
	deletePost
};
