import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import postRoutes from '../modules/post/post.routes';
import uploadRoutes from '../modules/upload/upload.routes';

const router = Router();
router.get('/', (req, res) => {
	res.status(200).send({
		status: true
	});
});
router.use('/auth', authRoutes);
router.use('/post', postRoutes);
router.use('/upload', uploadRoutes);

export default router;
