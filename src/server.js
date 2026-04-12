const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const incomingDir = path.join(__dirname, '..', 'data', 'incoming');
const maxUploadFiles = Number(process.env.MAX_UPLOAD_FILES) || 20;

fs.mkdirSync(incomingDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, incomingDir),
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginal}`);
  }
});

const upload = multer({
  storage,
  limits: { files: maxUploadFiles, fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image uploads are allowed.'));
      return;
    }
    cb(null, true);
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'photo-archive-web', timestamp: new Date().toISOString() });
});

app.get('/api/info', (_req, res) => {
  res.json({
    project: 'Photo-archive-',
    folders: [
      'data/incoming',
      'data/masters',
      'data/access',
      'data/derivatives',
      'metadata/sources',
      'metadata/vocab',
      'docs'
    ]
  });
});

app.post('/api/upload', upload.array('photos', maxUploadFiles), (req, res) => {
  const uploaded = (req.files || []).map((file) => ({
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    mimeType: file.mimetype
  }));

  res.status(201).json({
    message: 'Upload successful',
    count: uploaded.length,
    files: uploaded
  });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err) {
    res.status(400).json({ error: err.message || 'Upload failed' });
    return;
  }

  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`Photo archive web app running on http://localhost:${port}`);
});
