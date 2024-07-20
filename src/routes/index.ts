import { Router } from 'express';
import cors from 'cors';
import authRoutes from '../modules/auth/auth.routes';
import postRoutes from '../modules/post/post.routes';
import uploadRoutes from '../modules/upload/upload.routes';

const router = Router();

router.get('/', cors(), (req, res) => {
	res.status(200).send({
		status: true
	});
});
router.use('/auth', cors(), authRoutes);
router.use('/post', cors(), postRoutes);
router.use('/upload', cors(), uploadRoutes);

export default router;
