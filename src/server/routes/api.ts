import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  triggerCronEvaluation,
} from '../controllers/taskController.js';
import {
  getMessages,
  whatsappWebhookGet,
  whatsappWebhookPost,
  getGmailStatus,
  googleAuthCallback,
  gmailInboundEmail,
  gmailSendReply,
  instagramWebhookGet,
  instagramWebhookPost,
} from '../controllers/messageController.js';
import {
  processCommand,
  generateImage,
  getChatHistory,
  clearChatHistory,
} from '../controllers/aiController.js';
import { executeSearch } from '../controllers/searchController.js';
import { login, getProfile, updateProfile } from '../controllers/authController.js';
import {
  getPrometheusMetrics,
  getMetricsJson,
  getLogs,
  runSystemDiagnostics,
} from '../controllers/metricsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { swaggerSpec } from '../swagger/swaggerSpec.js';

export const apiRouter = Router();

// Apply rate limiting across all API routes
apiRouter.use(rateLimiter);

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Nexon Autonomous AI Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    capabilities: [
      'Task Management Engine (node-cron)',
      'Multi-Platform Gateway (WhatsApp, Gmail, Instagram)',
      'Generative AI & Media (Gemini)',
      'Web Aggregation & Search Pipeline',
      'Observability & Real-time Metrics',
    ],
  });
});

// Swagger Documentation JSON
apiRouter.get('/docs/json', (req, res) => {
  res.json(swaggerSpec);
});

// Auth Routes
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', authMiddleware, getProfile);
apiRouter.put('/auth/me', authMiddleware, updateProfile);
apiRouter.get('/auth/google', googleAuthCallback);

// Module 1: Tasks & Schedule Management API
apiRouter.get('/tasks', getTasks);
apiRouter.get('/tasks/:id', getTaskById);
apiRouter.post('/tasks', createTask);
apiRouter.put('/tasks/:id', updateTask);
apiRouter.delete('/tasks/:id', deleteTask);
apiRouter.post('/tasks/cron/evaluate', triggerCronEvaluation);

// Module 2: Multi-Platform Messaging & Webhooks Gateway
apiRouter.get('/messages', getMessages);
apiRouter.get('/webhooks/whatsapp', whatsappWebhookGet);
apiRouter.post('/webhooks/whatsapp', whatsappWebhookPost);
apiRouter.get('/auth/gmail/status', getGmailStatus);
apiRouter.post('/auth/gmail/inbound', gmailInboundEmail);
apiRouter.post('/auth/gmail/reply', gmailSendReply);
apiRouter.get('/webhooks/instagram', instagramWebhookGet);
apiRouter.post('/webhooks/instagram', instagramWebhookPost);

// Module 3: AI Commands, Generative Media & Web Search
apiRouter.post('/ai/command', processCommand);
apiRouter.post('/ai/generate-image', generateImage);
apiRouter.get('/ai/chat-history', getChatHistory);
apiRouter.delete('/ai/chat-history', clearChatHistory);
apiRouter.get('/search', executeSearch);

// Module 4: Observability, Metrics & Telemetry
apiRouter.get('/metrics', getPrometheusMetrics);
apiRouter.get('/metrics/json', getMetricsJson);
apiRouter.get('/logs', getLogs);
apiRouter.get('/diagnostics', runSystemDiagnostics);
