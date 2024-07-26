import { Router } from 'express';
import authenticateToken from '../../middleware/authenticateToken';
import postControllers from './post.controllers';

const router = Router();

router.get('/get-all', postControllers.getPosts);
router.get('/get-my', authenticateToken, postControllers.getMePosts);
router.get('/get-other/:id', authenticateToken, postControllers.getOtherPosts);
router.post('/create', authenticateToken, postControllers.createPost);
router.get('/get-like/:postId', authenticateToken, postControllers.getLikePost);
router.post('/like', authenticateToken, postControllers.likePost);
router.delete('/unlike', authenticateToken, postControllers.unLikePost);
router.delete('/delete/:id', authenticateToken, postControllers.deletePost);

export default router;
