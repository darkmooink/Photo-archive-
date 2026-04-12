export interface Photo {
  id: number;
  filename: string;
  original_path: string;
  clean_path: string | null;
  review_path: string | null;
  labeled_path: string | null;
  status: 'uploaded' | 'processing' | 'needs_review' | 'reviewed' | 'failed';
  source_type: 'print' | 'scan' | 'digital' | null;
  title: string | null;
  description: string | null;
  date_taken: string | null;
  date_approximate: number;
  location: string | null;
  keywords: string | null;
  corners: string | null;
  error_message: string | null;
  group_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PhotoWithPeople extends Photo {
  people: PersonTag[];
}

export interface PersonTag {
  person_id: number;
  name: string;
  face_region: string | null;
  label: string | null;
}
