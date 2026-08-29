import { db } from '../models/db.js';
import { geminiService } from './geminiService.js';
import { taskService } from './taskService.js';
import { wsService } from './wsService.js';
import { logger } from '../utils/logger.js';
import { InboundMessage } from '../types/index.js';

class WhatsAppService {
  /**
   * Handle webhook verification handshake from Meta Cloud API
   */
  public verifyWebhook(mode: string, token: string, challenge: string, expectedVerifyToken: string): string | null {
    if (mode === 'subscribe' && token === expectedVerifyToken) {
      logger.info('WhatsAppService', 'Meta Cloud API Webhook handshake successfully verified.');
      return challenge;
    }
    logger.warn('WhatsAppService', 'Meta Cloud API Webhook handshake failed: token mismatch');
    return null;
  }

  /**
   * Process incoming WhatsApp payload
   */
  public async processInboundPayload(payload: any): Promise<InboundMessage[]> {
    const processedMessages: InboundMessage[] = [];

    // Check standard Meta WhatsApp Cloud webhook format or simulator format
    let entries = [];
    if (payload.entry) {
      for (const entry of payload.entry) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            const contact = contacts.find((c: any) => c.wa_id === msg.from) || {};
            entries.push({
              sender: msg.from || '+155501982',
              senderName: contact.profile?.name || 'WhatsApp Contact',
              recipient: value.metadata?.display_phone_number || '+1415JARVIS',
              content: msg.text?.body || msg.body || (typeof msg === 'string' ? msg : 'Inbound WhatsApp transmission'),
              timestamp: msg.timestamp ? new Date(parseInt(msg.timestamp) * 1000).toISOString() : new Date().toISOString(),
            });
          }
        }
      }
    } else if (payload.sender && payload.content) {
      // Direct simulator format
      entries.push({
        sender: payload.sender,
        senderName: payload.senderName || 'WhatsApp User',
        recipient: payload.recipient || '+1 (415) NEXON-AI',
        content: payload.content,
        timestamp: payload.timestamp || new Date().toISOString(),
      });
    }

    for (const item of entries) {
      logger.info('WhatsAppService', `Processing inbound WhatsApp message from ${item.senderName} (${item.sender})`);

      // 1. NLP analysis via Jarvis engine
      const analysis = await geminiService.analyzeInboundMessage(
        'whatsapp',
        item.sender,
        item.senderName,
        item.content
      );

      // 2. Save message record
      const saved = db.addMessage({
        platform: 'whatsapp',
        sender: item.sender,
        senderName: item.senderName,
        recipient: item.recipient,
        content: item.content,
        timestamp: item.timestamp,
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

      // 3. If actionable, automatically create task in Jarvis Schedule engine
      if (analysis.actionable && analysis.extractedTask && analysis.extractedTask.title) {
        taskService.createTask({
          title: analysis.extractedTask.title,
          description: `Auto-extracted from WhatsApp message by ${item.senderName}: "${item.content}"`,
          dueDate: analysis.extractedTask.dueDate || new Date(Date.now() + 4 * 3600000).toISOString(),
          priority: analysis.extractedTask.priority || 'high',
          status: 'pending',
          tags: ['WhatsApp', 'Automated'],
          source: 'whatsapp',
        });
      }

      // 4. Broadcast to WebSocket
      wsService.broadcast('MESSAGE_RECEIVED', saved);
      wsService.broadcast('AUTO_REPLY_SENT', {
        messageId: saved.id,
        platform: 'whatsapp',
        recipient: item.sender,
        reply: analysis.suggestedReply,
      });

      processedMessages.push(saved);
    }

    return processedMessages;
  }
}

export const whatsappService = new WhatsAppService();
