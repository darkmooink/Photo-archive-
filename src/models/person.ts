export interface Person {
  id: number;
  name: string;
  notes: string | null;
  created_at: string;
}

export interface PersonWithPhotoCount extends Person {
  photo_count: number;
}
