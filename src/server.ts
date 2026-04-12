import 'dotenv/config';
import app from './app';
import { initDb } from './db/database';
import { startProcessor } from './jobs/processor';
import fs from 'fs';
import path from 'path';

const PORT = process.env['PORT'] ?? 3000;

['uploads', 'data', 'data/processed'].forEach(dir => {
  fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
});

initDb();
startProcessor();

app.listen(PORT, () => {
  console.log(`Photo Archive running on http://localhost:${PORT}`);
});
