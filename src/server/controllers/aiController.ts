import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService.js';
import { taskService } from '../services/taskService.js';
import { searchService } from '../services/searchService.js';
import { db } from '../models/db.js';
import { wsService } from '../services/wsService.js';

export const processCommand = async (req: Request, res: Response): Promise<void> => {
  const { command, enableWebSearch, history } = req.body;

  if (!command || typeof command !== 'string') {
    res.status(400).json({ success: false, error: 'Command string is required' });
    return;
  }

  // 1. If web search requested or query looks factual/current, get live context
  let injectedContext = '';
  let searchResults = undefined;
  if (enableWebSearch || /(who|what|where|when|current|latest|price|news|weather|specs)/i.test(command)) {
    try {
      const searchRes = await searchService.executeSearch(command);
      injectedContext = searchRes.aiSynthesizedContext;
      searchResults = searchRes.results;
    } catch (e) {}
  }

  // 2. Process via Jarvis AI engine
  const startTime = Date.now();
  const response = await geminiService.processCommand(command, history, injectedContext);

  // 3. If a task was extracted, save it
  let createdTask = undefined;
  if (response.extractedTask && response.extractedTask.title) {
    createdTask = taskService.createTask({
      title: response.extractedTask.title,
      description: response.extractedTask.description || `Autonomously generated from command: "${command}"`,
      dueDate: response.extractedTask.dueDate || new Date(Date.now() + 24 * 3600000).toISOString(),
      priority: response.extractedTask.priority || 'medium',
      status: 'pending',
      tags: response.extractedTask.tags || ['NLP'],
      source: 'nlp',
    });
  }

  const executionTimeMs = Date.now() - startTime;

  // 4. Save to chat history
  const userMsg = {
    id: `msg_${Date.now()}_u`,
    sender: 'user' as const,
    text: command,
    timestamp: new Date(Date.now() - executionTimeMs).toISOString(),
  };
  const jarvisMsg = {
    id: `msg_${Date.now()}_j`,
    sender: 'jarvis' as const,
    text: response.text,
    timestamp: new Date().toISOString(),
    metadata: {
      intent: response.intent,
      confidence: response.confidence,
      tasksCreated: createdTask ? [createdTask] : undefined,
      searchResults,
      executionTimeMs,
    },
  };

  db.addChatMessage(userMsg);
  db.addChatMessage(jarvisMsg);

  // 5. Broadcast to any open WS clients
  wsService.broadcast('AI_STATUS', {
    command,
    response: response.text,
    executionTimeMs,
  });

  res.json({
    success: true,
    data: {
      text: response.text,
      intent: response.intent,
      confidence: response.confidence,
      taskCreated: createdTask,
      searchResults,
      suggestedActions: response.suggestedActions,
      executionTimeMs,
    },
  });
};

export const generateImage = async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ success: false, error: 'Prompt is required' });
    return;
  }

  const result = await geminiService.generateImage(prompt);
  res.json({
    success: true,
    data: {
      prompt,
      imageUrl: result.imageUrl,
      source: result.source,
      timestamp: new Date().toISOString(),
    },
  });
};

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  const history = db.getChatHistory();
  res.json({ success: true, data: history });
};

export const clearChatHistory = async (req: Request, res: Response): Promise<void> => {
  db.clearChat();
  res.json({ success: true, message: 'Chat memory buffers flushed' });
};
