import { db } from '../models/db.js';
import { geminiService } from './geminiService.js';
import { taskService } from './taskService.js';
import { wsService } from './wsService.js';
import { logger } from '../utils/logger.js';
import { InboundMessage } from '../types/index.js';

class InstagramService {
  public verifyWebhook(mode: string, token: string, challenge: string, expectedVerifyToken: string): string | null {
    if (mode === 'subscribe' && token === expectedVerifyToken) {
      logger.info('InstagramService', 'Meta Graph API Instagram Webhook verified.');
      return challenge;
    }
    return null;
  }

  public async processInboundDM(payload: {
    sender: string;
    senderName?: string;
    content: string;
    recipient?: string;
  }): Promise<InboundMessage> {
    const sender = payload.sender.startsWith('@') ? payload.sender : `@${payload.sender}`;
    const senderName = payload.senderName || sender;
    logger.info('InstagramService', `Processing Instagram DM from ${senderName}: "${payload.content}"`);

    // Run Jarvis NLP
    const analysis = await geminiService.analyzeInboundMessage(
      'instagram',
      sender,
      senderName,
      payload.content
    );

    const saved = db.addMessage({
      platform: 'instagram',
      sender,
      senderName,
      recipient: payload.recipient || '@stark_industries',
      content: payload.content,
      timestamp: new Date().toISOString(),
      status: analysis.actionable ? 'flagged' : 'replied',
      parsedIntent: {
        intent: analysis.intent,
        confidence: analysis.confidence,
        actionable: analysis.actionable,
        extractedTask: analysis.extractedTask,
      },
      suggestedReply: analysis.suggestedReply,
      actualReplySent: analysis.suggestedReply,
    });

    if (analysis.actionable && analysis.extractedTask && analysis.extractedTask.title) {
      taskService.createTask({
        title: analysis.extractedTask.title,
        description: `Extracted from Instagram DM by ${senderName}: "${payload.content}"`,
        dueDate: analysis.extractedTask.dueDate || new Date(Date.now() + 24 * 3600000).toISOString(),
        priority: analysis.extractedTask.priority || 'medium',
        status: 'pending',
        tags: ['Instagram', 'DM'],
        source: 'instagram',
      });
    }

    wsService.broadcast('MESSAGE_RECEIVED', saved);
    wsService.broadcast('AUTO_REPLY_SENT', {
      messageId: saved.id,
      platform: 'instagram',
      recipient: sender,
      reply: analysis.suggestedReply,
    });

    return saved;
  }
}

export const instagramService = new InstagramService();
