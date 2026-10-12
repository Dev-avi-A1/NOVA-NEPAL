/**
 * NOVA NEPAL - Full-Stack Express Server with Vite Dev Middleware
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/api/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Mount B2B Marketplace REST API routes
  app.use('/api/v1', apiRouter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'NOVA NEPAL Engine', time: new Date().toISOString() });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NOVA NEPAL] Server online on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NOVA NEPAL] Startup failure:', err);
  process.exit(1);
});
