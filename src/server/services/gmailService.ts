import { db } from '../models/db.js';
import { geminiService } from './geminiService.js';
import { taskService } from './taskService.js';
import { wsService } from './wsService.js';
import { logger } from '../utils/logger.js';
import { InboundMessage } from '../types/index.js';

class GmailService {
  private isConnected: boolean = true;
  private connectedAccount: string = 'alex@workplace.io';

  public getAuthStatus() {
    return {
      connected: this.isConnected,
      account: this.connectedAccount,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
      ],
      lastSync: new Date().toISOString(),
    };
  }

  public async processInboundEmail(emailData: {
    sender: string;
    senderName?: string;
    subject: string;
    content: string;
    recipient?: string;
  }): Promise<InboundMessage> {
    const senderName = emailData.senderName || emailData.sender.split('@')[0];
    logger.info('GmailService', `Processing inbound email from ${senderName} regarding "${emailData.subject}"`);

    // 1. Run Jarvis NLP to extract intent, actionable requirements, and draft response
    const analysis = await geminiService.analyzeInboundMessage(
      'gmail',
      emailData.sender,
      senderName,
      emailData.content,
      emailData.subject
    );

    // 2. Save in database store
    const saved = db.addMessage({
      platform: 'gmail',
      sender: emailData.sender,
      senderName,
      recipient: emailData.recipient || this.connectedAccount,
      subject: emailData.subject,
      content: emailData.content,
      timestamp: new Date().toISOString(),
      status: 'received',
      parsedIntent: {
        intent: analysis.intent,
        confidence: analysis.confidence,
        actionable: analysis.actionable,
        extractedTask: analysis.extractedTask,
      },
      suggestedReply: analysis.suggestedReply,
    });

    // 3. If actionable, automatically queue task
    if (analysis.actionable && analysis.extractedTask && analysis.extractedTask.title) {
      taskService.createTask({
        title: analysis.extractedTask.title,
        description: `Extracted from Email: "${emailData.subject}" by ${senderName}`,
        dueDate: analysis.extractedTask.dueDate || new Date(Date.now() + 12 * 3600000).toISOString(),
        priority: analysis.extractedTask.priority || 'medium',
        status: 'pending',
        tags: ['Gmail', 'Email Action'],
        source: 'gmail',
      });
    }

    // 4. Broadcast to WebSocket HUD
    wsService.broadcast('MESSAGE_RECEIVED', saved);

    return saved;
  }

  public async sendReply(messageId: string, replyContent: string): Promise<InboundMessage | null> {
    const msg = db.getMessageById(messageId);
    if (!msg) return null;

    const updated = db.updateMessage(messageId, {
      status: 'replied',
      actualReplySent: replyContent,
    });

    if (updated) {
      wsService.broadcast('AUTO_REPLY_SENT', {
        messageId,
        platform: 'gmail',
        recipient: updated.sender,
        reply: replyContent,
      });
      logger.info('GmailService', `Dispatched reply to ${updated.sender}`);
    }

    return updated;
  }
}

export const gmailService = new GmailService();
