import { Router } from 'express';
import { getInbox } from '../controllers/photoController';

const router = Router();
router.get('/', getInbox);
export default router;
