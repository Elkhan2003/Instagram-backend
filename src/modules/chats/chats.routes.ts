import { Router } from 'express';
import chatsControllers from './chats.controller';

const router = Router();

router.get('/get', chatsControllers.getUser);

export default router;
