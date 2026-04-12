const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT) || 3000;

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

app.listen(port, () => {
  console.log(`Photo archive web app running on http://localhost:${port}`);
});
