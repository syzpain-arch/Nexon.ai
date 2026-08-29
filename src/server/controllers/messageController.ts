import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsappService.js';
import { gmailService } from '../services/gmailService.js';
import { instagramService } from '../services/instagramService.js';
import { db } from '../models/db.js';
import { env } from '../config/env.js';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const messages = db.getAllMessages();
  res.json({ success: true, count: messages.length, data: messages });
};

// WhatsApp Webhook Handshake & Ingest
export const whatsappWebhookGet = async (req: Request, res: Response): Promise<void> => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const verified = whatsappService.verifyWebhook(mode, token, challenge, env.WHATSAPP_VERIFY_TOKEN);
  if (verified) {
    res.status(200).send(verified);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
};

export const whatsappWebhookPost = async (req: Request, res: Response): Promise<void> => {
  const result = await whatsappService.processInboundPayload(req.body);
  res.status(200).json({ success: true, processed: result.length, data: result });
};

// Gmail Endpoints
export const getGmailStatus = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: gmailService.getAuthStatus() });
};

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'OAuth2 Authentication Flow verified for Gmail API',
    account: 'stark@avengers-hq.io',
    token: 'ya29.a0AfH6SMD_jarvis_simulated_token',
  });
};

export const gmailInboundEmail = async (req: Request, res: Response): Promise<void> => {
  const { sender, senderName, subject, content } = req.body;
  if (!sender || !content || !subject) {
    res.status(400).json({ success: false, error: 'sender, subject, and content are required' });
    return;
  }
  const result = await gmailService.processInboundEmail({ sender, senderName, subject, content });
  res.status(201).json({ success: true, data: result });
};

export const gmailSendReply = async (req: Request, res: Response): Promise<void> => {
  const { messageId, replyContent } = req.body;
  const result = await gmailService.sendReply(messageId, replyContent);
  if (!result) {
    res.status(404).json({ success: false, error: 'Message not found' });
    return;
  }
  res.json({ success: true, data: result });
};

// Instagram Webhooks
export const instagramWebhookGet = async (req: Request, res: Response): Promise<void> => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const verified = instagramService.verifyWebhook(mode, token, challenge, env.WHATSAPP_VERIFY_TOKEN);
  if (verified) {
    res.status(200).send(verified);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
};

export const instagramWebhookPost = async (req: Request, res: Response): Promise<void> => {
  const { sender, senderName, content } = req.body;
  const result = await instagramService.processInboundDM({
    sender: sender || '@user',
    senderName,
    content: content || 'Hello Jarvis',
  });
  res.status(200).json({ success: true, data: result });
};
