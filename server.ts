import express from 'express';
import path from 'path';
import downloadHandler from './api/download.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Download handler matching Serverless route
app.post('/api/download', (req: any, res: any) => {
  return downloadHandler(req, res);
});

// Serve frontend static files from /public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Catch-all to serve public/index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Run server on standard access port 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
