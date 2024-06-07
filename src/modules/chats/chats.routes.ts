import { Router } from 'express';
import chatsControllers from './chats.controller';

const router = Router();

router.get('/get', chatsControllers.getUser);
router.get('/get/:url/:resource', chatsControllers.getUserParams);
router.post('/post/ddos/:url', chatsControllers.limiterUserRequests);

export default router;
