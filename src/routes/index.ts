import { Router } from 'express';
import cors from 'cors';
import authRoutes from '../modules/auth/auth.routes';
import chatsRoutes from '../modules/chats/chats.routes';

const corsConfig = {
	origin: [
		'http://localhost:3000',
		'http://localhost:5173',
		'http://localhost:5000',
		'https://elchocrud.pro'
	],
	credentials: true
};

const router = Router();

router.get('/', cors(), (req, res) => {
	res.status(200).send({
		status: true
	});
});
router.use('/auth', cors(corsConfig), authRoutes);
router.use('/chats', cors(), chatsRoutes);

export default router;
