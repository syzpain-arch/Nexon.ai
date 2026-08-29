export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: "Nexon - Autonomous AI Assistant Platform API",
    description: "RESTful API endpoints for Nexon autonomous conversational AI assistant. Includes natural language task parsing, cron scheduling, WhatsApp/Gmail/Instagram gateways, search aggregation, generative media, and observability metrics.",
    version: '1.0.0',
    contact: {
      name: 'Nexon AI Systems',
      email: 'support@nexon-ai.io',
      url: 'https://nexon-ai.io',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Primary Nexon Express Core API Router',
    },
  ],
  paths: {
    '/tasks': {
      get: {
        summary: 'List All Scheduled Tasks',
        description: 'Retrieves all pending and completed tasks with optional filters for status, priority, and keyword search.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'pending', 'in_progress', 'completed', 'cancelled'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['all', 'low', 'medium', 'high', 'critical'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Array of tasks returned successfully' },
        },
      },
      post: {
        summary: 'Create or Parse Task via NLP',
        description: 'Accepts either structured JSON task fields or a natural language string in rawCommand (e.g., "Remind me to call John tomorrow at 5 PM").',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  rawCommand: { type: 'string', example: 'Remind me to review reactor telemetry tomorrow at 10 AM' },
                  title: { type: 'string', example: 'Review reactor telemetry' },
                  dueDate: { type: 'string', format: 'date-time' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Task parsed & scheduled' },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get Task by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Task found' }, '404': { description: 'Task not found' } },
      },
      put: {
        summary: 'Update Task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Task updated' } },
      },
      delete: {
        summary: 'Delete Task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Task deleted' } },
      },
    },
    '/ai/command': {
      post: {
        summary: 'Execute Jarvis Autonomous NLP Command',
        description: 'Sends a command to the Jarvis core engine. Handles task extraction, conversational queries, and live web search injection.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['command'],
                properties: {
                  command: { type: 'string', example: 'Schedule a team sync tomorrow at 3pm and check latest satellite orbital data' },
                  enableWebSearch: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Jarvis response with intent, task, and metadata' } },
      },
    },
    '/ai/generate-image': {
      post: {
        summary: 'Synthesize Holographic / Generative Media',
        description: 'Calls Google GenAI image endpoint or vector visualizer.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', example: 'Futuristic quantum reactor schematics in glowing blue lines' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Base64 image asset payload' } },
      },
    },
    '/search': {
      get: {
        summary: 'Live Web Aggregation & Search Pipeline',
        description: 'Performs live web aggregation, search metrics scraping, and context extraction.',
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Search results and AI synthesized context' } },
      },
    },
    '/webhooks/whatsapp': {
      get: { summary: 'Meta Cloud API WhatsApp Webhook Verification Handshake' },
      post: { summary: 'Meta Cloud API Inbound WhatsApp Message Ingest' },
    },
    '/webhooks/instagram': {
      get: { summary: 'Meta Graph API Instagram DM Webhook Verification' },
      post: { summary: 'Instagram Direct Message Ingest & Auto-Reply' },
    },
    '/auth/gmail/inbound': {
      post: {
        summary: 'Gmail API Inbound Email Ingest & Actionable Summarization',
        description: 'Ingests email, extracts action items, creates tasks, and drafts reply.',
      },
    },
    '/metrics': {
      get: {
        summary: 'Prometheus Metrics Exposition Endpoint',
        description: 'Standard Prometheus text format metrics for Prometheus scraper and Grafana dashboard.',
        responses: { '200': { description: 'Prometheus metrics text payload' } },
      },
    },
  },
};
