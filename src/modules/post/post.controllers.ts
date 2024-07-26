import { Request, Response } from 'express';
import moment from 'moment';
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
		// const userData = await prisma.user.findFirst({
		// 	where: { email: req.user?.email }
		// });
		// if (!userData) {
		// 	return res
		// 		.status(404)
		// 		.send({ message: 'Пользователь не прошел проверку подлинности' });
		// }
		const data = await prisma.post.findMany({
			where: { userId: req.user?.id }
		});
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

const getLikePost = async (req: Request<{ postId: string }>, res: Response) => {
	const { postId } = req.params;
	try {
		const postExists = await prisma.post.findUnique({
			where: {
				id: Number(postId)
			}
		});
		if (!postExists) {
			return res.status(404).send({ message: 'Пост не найден' });
		}
		const likesCount = await prisma.like.count({
			where: {
				postId: Number(postId)
			}
		});
		const userLike = await prisma.like.findFirst({
			where: {
				userId: req.user?.id,
				postId: Number(postId)
			}
		});
		const isLike = !!userLike;
		res.status(200).send({ postId, likesCount, isLike });
	} catch (error) {
		console.error('Ошибка при обработке запроса:', error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const likePost = async (req: Request, res: Response) => {
	const { postId } = req.body;
	try {
		const existingLike = await prisma.like.findFirst({
			where: {
				userId: req.user?.id,
				postId: Number(postId)
			}
		});
		if (existingLike) {
			return res
				.status(400)
				.send({ message: 'Пользователь уже поставил лайк этому посту' });
		}
		const like = await prisma.like.create({
			data: {
				userId: req.user?.id!,
				postId: Number(postId),
				createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
				updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
			}
		});
		const { id, ...responseLike } = like;
		res.status(200).send(responseLike);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const unLikePost = async (req: Request, res: Response) => {
	const { postId } = req.body;
	try {
		const existingLike = await prisma.like.findFirst({
			where: {
				userId: req.user?.id,
				postId: Number(postId)
			}
		});
		if (!existingLike) {
			return res.status(404).send({ message: 'Лайк не найден' });
		}
		const like = await prisma.like.delete({
			where: {
				userId_postId: {
					userId: req.user?.id!,
					postId: Number(postId)
				}
			}
		});
		const { id, createdAt, updatedAt, ...responseLike } = like;
		res.status(200).send(responseLike);
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
	getLikePost,
	likePost,
	unLikePost,
	deletePost
};
