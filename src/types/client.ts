export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  tags: string[];
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
  source: 'direct' | 'nlp' | 'whatsapp' | 'gmail' | 'instagram';
}

export interface InboundMessage {
  id: string;
  platform: 'whatsapp' | 'gmail' | 'instagram';
  sender: string;
  senderName: string;
  recipient: string;
  subject?: string;
  content: string;
  timestamp: string;
  status: 'received' | 'processing' | 'replied' | 'flagged';
  parsedIntent?: {
    intent: string;
    confidence: number;
    actionable: boolean;
    extractedTask?: Partial<Task>;
  };
  suggestedReply?: string;
  actualReplySent?: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp?: string;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  timeTakenMs: number;
  results: SearchResultItem[];
  aiSynthesizedContext: string;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  memoryTotalMb?: number;
  activeWsConnections: number;
  totalRequests: number;
  totalErrors: number;
  cronTasksExecuted: number;
  geminiInferencesCount: number;
  averageInferenceLatencyMs: number;
  averageHttpLatencyMs: number;
  cron?: {
    active: boolean;
    interval: string;
    lastRun: string | null;
  };
  systemStatus?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    tasksCreated?: Task[];
    searchResults?: SearchResultItem[];
    generatedImage?: string;
    executionTimeMs?: number;
    platformSource?: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  module: string;
  message: string;
  meta?: Record<string, any>;
}

export type ActiveTab =
  | 'console'
  | 'schedule'
  | 'gateways'
  | 'search'
  | 'media'
  | 'observability'
  | 'swagger'
  | 'devops';
