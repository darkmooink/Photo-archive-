import { Router, Request, Response } from 'express';
import { tagPersonOnPhoto, untagPersonOnPhoto, getPhotoById } from '../services/photoService';
import { getAllPeople } from '../services/personService';

const router = Router();

router.post('/photos/:id/tag-person', (req: Request, res: Response) => {
  const photoId = parseInt(req.params['id'] ?? '0', 10);
  const personId = parseInt((req.body as Record<string, string>)['person_id'] ?? '0', 10);
  if (!photoId || !personId) { res.status(400).json({ error: 'Invalid IDs' }); return; }
  tagPersonOnPhoto(photoId, personId);
  const photo = getPhotoById(photoId);
  res.json({ ok: true, people: photo?.people ?? [] });
});

router.delete('/photos/:id/tag-person/:personId', (req: Request, res: Response) => {
  const photoId = parseInt(req.params['id'] ?? '0', 10);
  const personId = parseInt(req.params['personId'] ?? '0', 10);
  untagPersonOnPhoto(photoId, personId);
  res.json({ ok: true });
});

router.get('/people', (_req: Request, res: Response) => {
  const people = getAllPeople();
  res.json(people);
});

export default router;
