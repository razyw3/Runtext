import express from 'express';
import path from 'path';
import downloadHandler from './api/download.js';

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * ======================================
 * API ROUTES (TIDAK DIUBAH)
 * ======================================
 */
app.post('/api/download', (req: any, res: any) => {
  return downloadHandler(req, res);
});

/**
 * ======================================
 * STATIC FILES
 * ======================================
 * public = legacy assets (script.js, css)
 */
app.use(express.static(path.join(process.cwd(), 'public')));

/**
 * ======================================
 * REACT SUPPORT (IMPORTANT FIX)
 * ======================================
 * Kalau nanti build React ada di /dist
 */
const distPath = path.join(process.cwd(), 'dist');

app.use(express.static(distPath));

/**
 * ======================================
 * CATCH ALL ROUTE
 * ======================================
 * PRIORITAS: React build dulu, fallback public
 */
app.get('*', (req, res) => {
  const reactIndex = path.join(distPath, 'index.html');
  const legacyIndex = path.join(process.cwd(), 'public', 'index.html');

  if (require('fs').existsSync(reactIndex)) {
    return res.sendFile(reactIndex);
  }

  return res.sendFile(legacyIndex);
});

/**
 * ======================================
 * START SERVER
 * ======================================
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});