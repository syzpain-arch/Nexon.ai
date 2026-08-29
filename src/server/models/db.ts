import { Task, InboundMessage, UserProfile, ChatMessage } from '../types/index.js';
import { logger } from '../utils/logger.js';

export const MongooseSchemaDefinitions = {
  TaskSchema: {
    title: { type: 'String', required: true },
    description: { type: 'String' },
    dueDate: { type: 'Date', required: true },
    priority: { type: 'String', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: 'String', enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
    tags: [{ type: 'String' }],
    reminderSent: { type: 'Boolean', default: false },
    source: { type: 'String', enum: ['direct', 'nlp', 'whatsapp', 'gmail', 'instagram'], default: 'direct' },
    createdAt: { type: 'Date', default: 'Date.now' },
    updatedAt: { type: 'Date', default: 'Date.now' }
  },
  MessageSchema: {
    platform: { type: 'String', enum: ['whatsapp', 'gmail', 'instagram'], required: true },
    sender: { type: 'String', required: true },
    senderName: { type: 'String' },
    recipient: { type: 'String' },
    subject: { type: 'String' },
    content: { type: 'String', required: true },
    timestamp: { type: 'Date', default: 'Date.now' },
    status: { type: 'String', enum: ['received', 'processing', 'replied', 'flagged'], default: 'received' },
    parsedIntent: {
      intent: 'String',
      confidence: 'Number',
      actionable: 'Boolean',
      extractedTask: 'Object'
    },
    suggestedReply: 'String',
    actualReplySent: 'String'
  },
  UserProfileSchema: {
    username: { type: 'String', required: true, unique: true },
    name: { type: 'String', required: true },
    role: { type: 'String', enum: ['admin', 'operator', 'guest'], default: 'admin' },
    email: { type: 'String', required: true },
    preferences: {
      voiceEnabled: { type: 'Boolean', default: true },
      autoReplyWhatsApp: { type: 'Boolean', default: true },
      autoReplyGmail: { type: 'Boolean', default: true },
      autoReplyInstagram: { type: 'Boolean', default: true },
      theme: { type: 'String', default: 'dark' },
      cronIntervalSeconds: { type: 'Number', default: 30 }
    }
  },
  ContextLogSchema: {
    query: { type: 'String', required: true },
    intent: { type: 'String' },
    source: { type: 'String' },
    response: { type: 'String' },
    latencyMs: { type: 'Number' },
    timestamp: { type: 'Date', default: 'Date.now' }
  }
};

class DatabaseStore {
  private tasks: Map<string, Task> = new Map();
  private messages: Map<string, InboundMessage> = new Map();
  private chatHistory: ChatMessage[] = [];
  private userProfile: UserProfile;

  constructor() {
    this.userProfile = {
      id: 'usr_nexon_01',
      username: 'user_primary',
      name: 'Alex Rivera',
      role: 'admin',
      email: 'alex@workplace.io',
      preferences: {
        voiceEnabled: true,
        autoReplyWhatsApp: true,
        autoReplyGmail: true,
        autoReplyInstagram: false,
        theme: 'dark',
        cronIntervalSeconds: 30,
      },
    };

    this.seedInitialData();
  }

  private seedInitialData() {
    const now = new Date();
    const tomorrow10am = new Date(now);
    tomorrow10am.setDate(tomorrow10am.getDate() + 1);
    tomorrow10am.setHours(10, 0, 0, 0);

    const tomorrow3pm = new Date(now);
    tomorrow3pm.setDate(tomorrow3pm.getDate() + 1);
    tomorrow3pm.setHours(15, 0, 0, 0);

    const friday2pm = new Date(now);
    friday2pm.setDate(friday2pm.getDate() + 3);
    friday2pm.setHours(14, 0, 0, 0);

    const initialTasks: Task[] = [
      {
        id: 'tsk_01',
        title: 'Review MediaTek Dimensity 9400 chipset market report',
        description: 'Analyze TSMC 3nm benchmark data, NPU 890 generative AI performance, and smartphone market shares.',
        dueDate: tomorrow10am.toISOString(),
        priority: 'high',
        status: 'in_progress',
        tags: ['MediaTek', 'Market Analysis', 'Tech'],
        reminderSent: false,
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'direct',
      },
      {
        id: 'tsk_02',
        title: 'Check regional weather forecast for weekend trip',
        description: 'Review 5-day temperature trends, humidity, and rain probabilities.',
        dueDate: tomorrow3pm.toISOString(),
        priority: 'medium',
        status: 'pending',
        tags: ['Weather', 'Planning'],
        reminderSent: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'nlp',
      },
      {
        id: 'tsk_03',
        title: 'Quarterly team sync & schedule review',
        description: 'Go over sprint deliverables, client feedback, and milestone planning.',
        dueDate: friday2pm.toISOString(),
        priority: 'medium',
        status: 'pending',
        tags: ['Work', 'Schedule'],
        reminderSent: false,
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'direct',
      },
    ];

    for (const t of initialTasks) {
      this.tasks.set(t.id, t);
    }

    const initialMessages: InboundMessage[] = [
      {
        id: 'msg_wa_01',
        platform: 'whatsapp',
        sender: '+1 (415) 890-2341',
        senderName: 'Sarah Jenkins',
        recipient: '+1 (415) NEXON-AI',
        content: 'Hey Alex! Could you send over the MediaTek benchmark comparison chart before our 4 PM sync?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'replied',
        parsedIntent: {
          intent: 'request_report',
          confidence: 0.97,
          actionable: true,
          extractedTask: {
            title: 'Send MediaTek benchmark chart to Sarah Jenkins',
            priority: 'high',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          },
        },
        suggestedReply: 'Hi Sarah! I have noted your request and will send over the MediaTek benchmark chart shortly.',
        actualReplySent: 'Hi Sarah! I have noted your request and will send over the MediaTek benchmark chart shortly.',
      },
      {
        id: 'msg_gm_01',
        platform: 'gmail',
        sender: 'michael.chen@techventures.io',
        senderName: 'Michael Chen',
        recipient: 'alex@workplace.io',
        subject: 'Q3 Semiconductor & Chipset Market Briefing',
        content: 'Hi Alex, following up on our discussion regarding global mobile silicon growth and MediaTek/Qualcomm market shares. Are you free for a quick call tomorrow morning?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        status: 'received',
        parsedIntent: {
          intent: 'meeting_request',
          confidence: 0.95,
          actionable: true,
          extractedTask: {
            title: 'Schedule call with Michael Chen on semiconductor briefing',
            priority: 'medium',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
          },
        },
        suggestedReply: 'Hello Michael, thank you for reaching out! Alex is available tomorrow morning. Nexon has logged this in the schedule.',
      },
      {
        id: 'msg_ig_01',
        platform: 'instagram',
        sender: '@tech_innovators',
        senderName: 'Tech Innovators Guild',
        recipient: '@alex_tech',
        content: 'Love your recent analysis on on-device AI accelerators and MediaTek NPUs! Keep up the great work!',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        status: 'received',
        parsedIntent: {
          intent: 'community_feedback',
          confidence: 0.92,
          actionable: false,
        },
        suggestedReply: 'Thank you so much for the kind words and support! Excited to share more deep dives soon.',
      },
    ];

    for (const m of initialMessages) {
      this.messages.set(m.id, m);
    }

    this.chatHistory.push({
      id: 'chat_init_01',
      sender: 'system',
      text: 'Hi there! Nexon is ready to assist you. Ask me anything, manage your daily schedule, check weather updates, or analyze tech and market trends.',
      timestamp: new Date().toISOString(),
    });

    logger.system('DatabaseStore', 'Nexon data store initialized successfully.');
  }

  // Task Operations
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Task {
    const newTask: Task = {
      ...taskData,
      id: taskData.id || `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: taskData.tags || ['Nexon'],
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      reminderSent: taskData.reminderSent || false,
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const existing = this.tasks.get(id);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  // Message Operations
  public getAllMessages(): InboundMessage[] {
    return Array.from(this.messages.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getMessageById(id: string): InboundMessage | undefined {
    return this.messages.get(id);
  }

  public addMessage(msg: Omit<InboundMessage, 'id'> & { id?: string }): InboundMessage {
    const newMsg: InboundMessage = {
      ...msg,
      id: msg.id || `msg_${msg.platform}_${Date.now()}`,
    };
    this.messages.set(newMsg.id, newMsg);
    return newMsg;
  }

  public updateMessage(id: string, updates: Partial<InboundMessage>): InboundMessage | null {
    const existing = this.messages.get(id);
    if (!existing) return null;
    const updated: InboundMessage = { ...existing, ...updates };
    this.messages.set(id, updated);
    return updated;
  }

  // Chat History
  public getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  public addChatMessage(msg: ChatMessage): void {
    this.chatHistory.push(msg);
    if (this.chatHistory.length > 200) {
      this.chatHistory.shift();
    }
  }

  public clearChat(): void {
    this.chatHistory = [];
  }

  // User Profile
  public getUserProfile(): UserProfile {
    return this.userProfile;
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.userProfile = {
      ...this.userProfile,
      ...updates,
      preferences: {
        ...this.userProfile.preferences,
        ...(updates.preferences || {}),
      },
    };
    return this.userProfile;
  }
}

export const db = new DatabaseStore();
