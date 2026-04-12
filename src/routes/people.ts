import { Router } from 'express';
import {
  listPeople,
  getNewPersonForm,
  createPersonHandler,
  getPersonDetail,
  getEditPersonForm,
  savePersonHandler,
  deletePersonHandler,
} from '../controllers/personController';

const router = Router();

router.get('/', listPeople);
router.get('/new', getNewPersonForm);
router.post('/new', createPersonHandler);
router.get('/:id', getPersonDetail);
router.get('/:id/edit', getEditPersonForm);
router.post('/:id/edit', savePersonHandler);
router.delete('/:id', deletePersonHandler);

export default router;
