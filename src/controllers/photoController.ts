import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  getAllPhotos,
  getPhotoById,
  createPhoto,
  updatePhoto,
  deletePhoto,
  getInboxPhotos,
} from '../services/photoService';
import { enqueue } from '../jobs/processor';
import { Photo } from '../models/photo';

export function getInbox(req: Request, res: Response): void {
  const photos = getInboxPhotos();
  res.render('index', { photos, title: 'Inbox' });
}

export function listPhotos(req: Request, res: Response): void {
  const status = req.query['status'] as string | undefined;
  const photos = getAllPhotos(status);
  res.render('photos/list', { photos, status: status ?? '', title: 'All Photos' });
}

export function getUploadForm(req: Request, res: Response): void {
  res.render('photos/upload', { title: 'Upload Photo', error: null });
}

export function handleUpload(req: Request, res: Response): void {
  if (!req.file) {
    res.render('photos/upload', { title: 'Upload Photo', error: 'No file uploaded' });
    return;
  }
  const relativePath = path.join('uploads', req.file.filename);
  const photo = createPhoto({
    filename: req.file.filename,
    original_path: relativePath,
    status: 'uploaded',
    source_type: (req.body['source_type'] as Photo['source_type']) ?? null,
    title: (req.body['title'] as string) || null,
  });
  enqueue(photo.id);
  res.redirect(`/photos/${photo.id}`);
}

export function getPhotoDetail(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const photo = getPhotoById(id);
  if (!photo) { res.status(404).render('404', { title: 'Not Found' }); return; }
  res.render('photos/detail', { photo, title: photo.title ?? photo.filename });
}

export function getEditForm(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const photo = getPhotoById(id);
  if (!photo) { res.status(404).render('404', { title: 'Not Found' }); return; }
  res.render('photos/edit', { photo, title: `Edit – ${photo.title ?? photo.filename}` });
}

export function saveEdit(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const body = req.body as Record<string, string>;
  updatePhoto(id, {
    title: body['title'] || null,
    description: body['description'] || null,
    date_taken: body['date_taken'] || null,
    date_approximate: body['date_approximate'] === '1' ? 1 : 0,
    location: body['location'] || null,
    keywords: body['keywords'] || null,
    source_type: (body['source_type'] as Photo['source_type']) || null,
    group_id: body['group_id'] ? parseInt(body['group_id'], 10) : null,
  });
  res.redirect(`/photos/${id}`);
}

export function markReviewed(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  updatePhoto(id, { status: 'reviewed' });
  res.redirect(`/photos/${id}`);
}

export function reprocess(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  updatePhoto(id, { status: 'uploaded' });
  enqueue(id);
  res.redirect(`/photos/${id}`);
}

export function saveCorners(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const corners = req.body['corners'] as string;
  updatePhoto(id, { corners, status: 'uploaded' });
  enqueue(id);
  res.json({ ok: true });
}

export function deletePhotoHandler(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const photo = getPhotoById(id);
  if (photo) {
    // Remove files from disk
    const filesToRemove = [photo.original_path, photo.clean_path, photo.review_path, photo.labeled_path];
    filesToRemove.forEach(fp => {
      if (fp) {
        const full = path.join(process.cwd(), fp);
        try { fs.unlinkSync(full); } catch { /* ignore */ }
      }
    });
    deletePhoto(id);
  }
  res.redirect('/photos');
}
