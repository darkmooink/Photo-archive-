import { processPhotoJob } from './photoProcessor';

const queue: number[] = [];
let processing = false;

export function enqueue(photoId: number): void {
  queue.push(photoId);
  if (!processing) {
    scheduleNext();
  }
}

function scheduleNext(): void {
  setImmediate(async () => {
    if (queue.length === 0) {
      processing = false;
      return;
    }
    processing = true;
    const id = queue.shift()!;
    try {
      await processPhotoJob(id);
    } catch (err) {
      console.error(`Processor: unhandled error for photo ${id}:`, err);
    }
    scheduleNext();
  });
}

export function startProcessor(): void {
  // Re-queue any photos stuck in 'processing' state from a previous run
  try {
    const { getDb } = require('../db/database');
    const db = getDb();
    const stuck = db.prepare("SELECT id FROM photos WHERE status = 'processing'").all() as { id: number }[];
    stuck.forEach(row => enqueue(row.id));
    if (stuck.length > 0) {
      console.log(`Re-queued ${stuck.length} stuck photo(s)`);
    }
  } catch (err) {
    console.error('startProcessor: could not re-queue stuck photos:', err);
  }
}
