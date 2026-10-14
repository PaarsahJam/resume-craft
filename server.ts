import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { buildAiRouter } from './src/server/aiRoutes';
import { getOpenRouterKey, getOpenRouterModelDetails } from './src/server/openRouter';

dotenv.config({ path: ['.env.local', '.env'] });

/**
 * Server binding. Defaults to loopback so a fresh clone is not publicly
 * reachable; set HOST=0.0.0.0 for the documented container/VM deployment
 * model (Cloud Run, Render, Railway, Fly.io).
 */
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Resume payloads are small; 1 MB is generous and far below the old 10 MB.
  app.use(express.json({ limit: '1mb' }));

  // Health check (no auth, no AI).
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI endpoints. The app starts without an API key; these return a clear,
  // safe configuration error (503 not_configured) until one is provided.
  //
  // Log the resolved model so a deployment that silently falls back to the
  // built-in default is visible in the startup output. Model ids are public
  // configuration; the API key is never logged.
  const { model: openRouterModel, source: openRouterModelSource } = getOpenRouterModelDetails();
  console.log(
    `[config] OpenRouter model: ${openRouterModel} (source: ${
      openRouterModelSource === 'env' ? 'OPENROUTER_MODEL environment override' : 'built-in default'
    })`
  );

  if (!getOpenRouterKey()) {
    console.warn('[config] OPENROUTER_API_KEY is not set. AI endpoints will return 503 until it is configured.');
  }
  app.use('/api/ai', buildAiRouter());

  // Serve Vite in development mode or dist in production.
  //
  // Vite is imported dynamically and only in development. A top-level static
  // import left `require("vite")` in the production bundle, which would make
  // every serverless cold start load the entire Vite toolchain for nothing.
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`ResumeCraft AI server running on http://${HOST}:${PORT}`);
  });
}

startServer();
