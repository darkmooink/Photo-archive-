import { Request, Response } from 'express';
import {
  getAllPeople,
  getPersonById,
  getPersonPhotos,
  createPerson,
  updatePerson,
  deletePerson,
} from '../services/personService';

export function listPeople(req: Request, res: Response): void {
  const people = getAllPeople();
  res.render('people/list', { people, title: 'People' });
}

export function getNewPersonForm(req: Request, res: Response): void {
  res.render('people/edit', { person: null, title: 'New Person' });
}

export function createPersonHandler(req: Request, res: Response): void {
  const body = req.body as Record<string, string>;
  const person = createPerson({ name: body['name'] ?? '', notes: body['notes'] || null });
  res.redirect(`/people/${person.id}`);
}

export function getPersonDetail(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const person = getPersonById(id);
  if (!person) { res.status(404).render('404', { title: 'Not Found' }); return; }
  const photos = getPersonPhotos(id);
  res.render('people/detail', { person, photos, title: person.name });
}

export function getEditPersonForm(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const person = getPersonById(id);
  if (!person) { res.status(404).render('404', { title: 'Not Found' }); return; }
  res.render('people/edit', { person, title: `Edit – ${person.name}` });
}

export function savePersonHandler(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  const body = req.body as Record<string, string>;
  updatePerson(id, { name: body['name'] ?? '', notes: body['notes'] || null });
  res.redirect(`/people/${id}`);
}

export function deletePersonHandler(req: Request, res: Response): void {
  const id = parseInt(req.params['id'] ?? '0', 10);
  deletePerson(id);
  res.redirect('/people');
}
