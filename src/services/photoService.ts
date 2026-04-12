import { getDb } from '../db/database';
import { Photo, PhotoWithPeople, PersonTag } from '../models/photo';

export function getAllPhotos(status?: string): Photo[] {
  const db = getDb();
  if (status) {
    return db.prepare('SELECT * FROM photos WHERE status = ? ORDER BY created_at DESC').all(status) as Photo[];
  }
  return db.prepare('SELECT * FROM photos ORDER BY created_at DESC').all() as Photo[];
}

export function getPhotoById(id: number): PhotoWithPeople | null {
  const db = getDb();
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as Photo | undefined;
  if (!photo) return null;
  const people = getPeopleForPhoto(id);
  return { ...photo, people };
}

export function createPhoto(data: Partial<Photo>): Photo {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO photos (filename, original_path, status, source_type, title)
    VALUES (@filename, @original_path, @status, @source_type, @title)
  `);
  const result = stmt.run({
    filename: data.filename ?? '',
    original_path: data.original_path ?? '',
    status: data.status ?? 'uploaded',
    source_type: data.source_type ?? null,
    title: data.title ?? null,
  });
  return getPhotoById(result.lastInsertRowid as number) as Photo;
}

export function updatePhoto(id: number, data: Partial<Photo>): void {
  const db = getDb();
  const fields = Object.keys(data)
    .filter(k => k !== 'id')
    .map(k => `${k} = @${k}`)
    .join(', ');
  if (!fields) return;
  db.prepare(`UPDATE photos SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...data, id });
}

export function deletePhoto(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM photos WHERE id = ?').run(id);
}

export function getInboxPhotos(): PhotoWithPeople[] {
  const db = getDb();
  const photos = db.prepare("SELECT * FROM photos WHERE status = 'needs_review' ORDER BY created_at DESC").all() as Photo[];
  return photos.map(p => ({ ...p, people: getPeopleForPhoto(p.id) }));
}

export function getInboxCount(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM photos WHERE status = 'needs_review'").get() as { count: number };
  return row.count;
}

export function getPeopleForPhoto(photoId: number): PersonTag[] {
  const db = getDb();
  return db.prepare(`
    SELECT pp.person_id, p.name, pp.face_region, pp.label
    FROM photo_people pp
    JOIN people p ON p.id = pp.person_id
    WHERE pp.photo_id = ?
  `).all(photoId) as PersonTag[];
}

export function tagPersonOnPhoto(photoId: number, personId: number): void {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO photo_people (photo_id, person_id) VALUES (?, ?)').run(photoId, personId);
}

export function untagPersonOnPhoto(photoId: number, personId: number): void {
  const db = getDb();
  db.prepare('DELETE FROM photo_people WHERE photo_id = ? AND person_id = ?').run(photoId, personId);
}
