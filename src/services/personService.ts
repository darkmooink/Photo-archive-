import { getDb } from '../db/database';
import { Person, PersonWithPhotoCount } from '../models/person';
import { Photo } from '../models/photo';

export function getAllPeople(): PersonWithPhotoCount[] {
  const db = getDb();
  return db.prepare(`
    SELECT p.*, COUNT(pp.photo_id) as photo_count
    FROM people p
    LEFT JOIN photo_people pp ON pp.person_id = p.id
    GROUP BY p.id
    ORDER BY p.name ASC
  `).all() as PersonWithPhotoCount[];
}

export function getPersonById(id: number): Person | null {
  const db = getDb();
  return (db.prepare('SELECT * FROM people WHERE id = ?').get(id) as Person | undefined) ?? null;
}

export function getPersonPhotos(personId: number): Photo[] {
  const db = getDb();
  return db.prepare(`
    SELECT ph.* FROM photos ph
    JOIN photo_people pp ON pp.photo_id = ph.id
    WHERE pp.person_id = ?
    ORDER BY ph.created_at DESC
  `).all(personId) as Photo[];
}

export function createPerson(data: Partial<Person>): Person {
  const db = getDb();
  const result = db.prepare('INSERT INTO people (name, notes) VALUES (@name, @notes)').run({
    name: data.name ?? '',
    notes: data.notes ?? null,
  });
  return getPersonById(result.lastInsertRowid as number) as Person;
}

export function updatePerson(id: number, data: Partial<Person>): void {
  const db = getDb();
  const fields = Object.keys(data)
    .filter(k => k !== 'id')
    .map(k => `${k} = @${k}`)
    .join(', ');
  if (!fields) return;
  db.prepare(`UPDATE people SET ${fields} WHERE id = @id`).run({ ...data, id });
}

export function deletePerson(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM people WHERE id = ?').run(id);
}
