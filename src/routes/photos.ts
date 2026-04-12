import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  listPhotos,
  getUploadForm,
  handleUpload,
  getPhotoDetail,
  getEditForm,
  saveEdit,
  markReviewed,
  reprocess,
  saveCorners,
  deletePhotoHandler,
} from '../controllers/photoController';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

router.get('/', listPhotos);
router.get('/upload', getUploadForm);
router.post('/upload', upload.array('photos', 50), handleUpload);
router.get('/:id', getPhotoDetail);
router.get('/:id/edit', getEditForm);
router.post('/:id/edit', saveEdit);
router.post('/:id/review', markReviewed);
router.post('/:id/reprocess', reprocess);
router.post('/:id/corners', saveCorners);
router.delete('/:id', deletePhotoHandler);

export default router;
