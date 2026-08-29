import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes/api.js';
import { wsService } from './src/server/services/wsService.js';
import { cronSchedulerService } from './src/server/services/cronService.js';
import { errorHandler } from './src/server/middleware/errorHandler.js';
import { logger } from './src/server/utils/logger.js';
import { metricsRegistry } from './src/server/utils/metrics.js';
import { validateEnv } from './src/server/config/env.js';

async function bootstrapJarvisServer() {
  const app = express();
  const PORT = 3000;

  // Environment validation report
  const envValidation = validateEnv();
  for (const w of envValidation.warnings) {
    logger.warn('EnvConfig', w);
  }

  // Core Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request telemetry tracking middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      metricsRegistry.recordHttpRequest(req.method, req.path, res.statusCode, duration);
    });
    next();
  });

  // Mount API Router FIRST
  app.use('/api', apiRouter);

  // Global Error Handler for API
  app.use('/api', errorHandler);

  // Create HTTP Server & Attach WebSocket Hub
  const httpServer = http.createServer(app);
  wsService.initialize(httpServer);

  // Start Autonomous Background Cron Scheduler
  cronSchedulerService.start();

  // Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Server', 'Initializing Vite SPA middleware in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    logger.info('Server', 'Serving static build from dist folder...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.system('Server', `🚀 JARVIS Autonomous Platform live at http://0.0.0.0:${PORT}`);
    logger.system('Server', `⚡ WebSocket HUD stream mounted on ws://0.0.0.0:${PORT}/ws`);
    logger.system('Server', `📊 Prometheus metrics available at /api/metrics`);
  });
}

bootstrapJarvisServer().catch((err) => {
  console.error('Fatal startup error in Jarvis server:', err);
  process.exit(1);
});
