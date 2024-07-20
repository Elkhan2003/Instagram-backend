import { Router } from 'express';
import authControllers from '../auth/auth.controllers';
import postControllers from './post.controllers';

const router = Router();

router.get('/get-all', postControllers.getPosts);
router.get(
	'/get-my',
	authControllers.authenticateToken,
	postControllers.getMePosts
);
router.get(
	'/get-other/:id',
	authControllers.authenticateToken,
	postControllers.getOtherPosts
);
router.post(
	'/create',
	authControllers.authenticateToken,
	postControllers.createPost
);
router.delete(
	'/delete/:id',
	authControllers.authenticateToken,
	postControllers.deletePost
);

export default router;
