import { getPhotoById, updatePhoto } from '../services/photoService';
import { processPhoto } from '../services/imageService';

export async function processPhotoJob(photoId: number): Promise<void> {
  updatePhoto(photoId, { status: 'processing' });

  try {
    const photo = getPhotoById(photoId);
    if (!photo) {
      console.error(`processPhotoJob: photo ${photoId} not found`);
      return;
    }

    const { cleanPath, reviewPath, labeledPath } = await processPhoto(photo);

    updatePhoto(photoId, {
      clean_path: cleanPath,
      review_path: reviewPath,
      labeled_path: labeledPath,
      status: 'needs_review',
      error_message: null,
    });

    console.log(`Processed photo ${photoId} → needs_review`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`processPhotoJob failed for photo ${photoId}:`, msg);
    updatePhoto(photoId, { status: 'failed', error_message: msg });
  }
}
