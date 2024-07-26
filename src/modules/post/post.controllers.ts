import { Request, Response } from 'express';
import moment from 'moment';
import { prisma } from '../../plugins/prisma';

const getPosts = async (req: Request, res: Response) => {
	try {
		const data = await prisma.post.findMany({
			orderBy: { updatedAt: 'desc' }
		});
		res.status(200).send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const getMePosts = async (req: Request, res: Response) => {
	try {
		const data = await prisma.post.findMany({
			where: { userId: req.user?.id },
			orderBy: { updatedAt: 'desc' }
		});
		res.status(200).send(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const getOtherPosts = async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;
	try {
		const data = await prisma.post.findMany({
			where: { userId: Number(id) },
			orderBy: { updatedAt: 'desc' }
		});
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

// const getLikePost = async (req: Request<{ postId: string }>, res: Response) => {
// 	const { postId } = req.params;
// 	const postIdNumber = Number(postId);
// 	try {
// 		const [postExists, likesCount, userLike, likedUsers] = await Promise.all([
// 			prisma.post.findUnique({ where: { id: postIdNumber } }),
// 			prisma.like.count({ where: { postId: postIdNumber } }),
// 			prisma.like.findFirst({
// 				where: { userId: req.user?.id, postId: postIdNumber }
// 			}),
// 			prisma.user.findMany({
// 				where: { likes: { some: { postId: postIdNumber } } },
// 				select: { username: true, photo: true },
// 				orderBy: { createdAt: 'desc' }
// 			})
// 		]);

// 		if (!postExists) {
// 			return res.status(404).send({ message: 'Пост не найден' });
// 		}

// 		const isLike = !!userLike;
// 		res.status(200).send({
// 			postId: postIdNumber,
// 			likesCount,
// 			isLike,
// 			likedUsers: likedUsers.map((user) => ({
// 				username: user.username,
// 				photo: user.photo
// 			}))
// 		});
// 	} catch (error) {
// 		console.error('Ошибка при обработке запроса:', error);
// 		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
// 	}
// };

const getLikePost = async (req: Request<{ postId: string }>, res: Response) => {
	const { postId } = req.params;
	const postIdNumber = Number(postId);
	try {
		const [postExists, likesCount, userLike, likesWithUsers] =
			await Promise.all([
				prisma.post.findUnique({ where: { id: postIdNumber } }),
				prisma.like.count({ where: { postId: postIdNumber } }),
				prisma.like.findFirst({
					where: { userId: req.user?.id, postId: postIdNumber }
				}),
				prisma.like.findMany({
					where: { postId: postIdNumber },
					include: { user: { select: { username: true, photo: true } } },
					orderBy: { createdAt: 'desc' }
				})
			]);
		if (!postExists) {
			return res.status(404).send({ message: 'Пост не найден' });
		}
		const isLike = !!userLike;
		const likedUsers = likesWithUsers.map((like) => ({
			username: like.user.username,
			photo: like.user.photo,
			likedAt: like.createdAt
		}));
		res.status(200).send({
			postId: postIdNumber,
			likesCount,
			isLike,
			likedUsers
		});
	} catch (error) {
		console.error('Ошибка при обработке запроса:', error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const likePost = async (req: Request, res: Response) => {
	const { postId } = req.body;
	const postIdNumber = Number(postId);
	try {
		const existingLike = await prisma.like.findFirst({
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
			userId: req.user?.id!,
			postId: postIdNumber,
			createdAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z'),
			updatedAt: moment().utcOffset(6).format('YYYY-MM-DD HH:mm:ss Z')
		};
		res.status(200).send(like);
		await prisma.like.create({
			data: like
		});
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
	}
};

const unLikePost = async (req: Request, res: Response) => {
	const { postId } = req.body;
	const postIdNumber = Number(postId);
	try {
		const existingLike = await prisma.like.findFirst({
			where: {
				userId: req.user?.id,
				postId: postIdNumber
			}
		});
		if (!existingLike) {
			return res.status(404).send({ message: 'Лайк не найден' });
		}
		const like = {
			userId: req.user?.id!,
			postId: postIdNumber
		};
		res.status(200).send(like);
		await prisma.like.delete({
			where: {
				userId_postId: like
			}
		});
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
