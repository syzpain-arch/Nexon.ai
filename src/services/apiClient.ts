import { Task, InboundMessage, SearchResponse, SystemMetrics, ChatMessage, LogEntry } from '../types/client.js';

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errorBody.error?.message || errorBody.error || errorBody.message || 'API request failed');
    }

    return res.json();
  }

  // Health
  public async getHealth() {
    return this.request<{ status: string; capabilities: string[] }>('/health');
  }

  // Module 1: Tasks
  public async getTasks(params?: { status?: string; priority?: string; search?: string }): Promise<{ success: boolean; data: Task[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    return this.request(`/tasks?${query.toString()}`);
  }

  public async createTask(payload: { rawCommand?: string; title?: string; description?: string; dueDate?: string; priority?: string; tags?: string[] }) {
    return this.request<{ success: boolean; message: string; data: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateTask(id: string, updates: Partial<Task>) {
    return this.request<{ success: boolean; data: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteTask(id: string) {
    return this.request<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  public async triggerCronEvaluation() {
    return this.request<{ success: boolean; message: string; status: any }>('/tasks/cron/evaluate', {
      method: 'POST',
    });
  }

  // Module 2: Gateways & Messages
  public async getMessages(): Promise<{ success: boolean; data: InboundMessage[] }> {
    return this.request('/messages');
  }

  public async simulateWhatsAppMessage(payload: { sender: string; senderName?: string; content: string }) {
    return this.request<{ success: boolean; data: InboundMessage[] }>('/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async simulateGmailInbound(payload: { sender: string; senderName?: string; subject: string; content: string }) {
    return this.request<{ success: boolean; data: InboundMessage }>('/auth/gmail/inbound', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async sendGmailReply(messageId: string, replyContent: string) {
    return this.request<{ success: boolean; data: InboundMessage }>('/auth/gmail/reply', {
      method: 'POST',
      body: JSON.stringify({ messageId, replyContent }),
    });
  }

  public async simulateInstagramDM(payload: { sender: string; senderName?: string; content: string }) {
    return this.request<{ success: boolean; data: InboundMessage }>('/webhooks/instagram', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Module 3: AI & Media & Search
  public async sendAiCommand(command: string, enableWebSearch: boolean = true) {
    return this.request<{
      success: boolean;
      data: {
        text: string;
        intent: string;
        confidence: number;
        taskCreated?: Task;
        searchResults?: any[];
        suggestedActions?: string[];
        executionTimeMs: number;
      };
    }>('/ai/command', {
      method: 'POST',
      body: JSON.stringify({ command, enableWebSearch }),
    });
  }

  public async generateImage(prompt: string) {
    return this.request<{
      success: boolean;
      data: {
        prompt: string;
        imageUrl: string;
        source: 'gemini' | 'fallback';
        timestamp: string;
      };
    }>('/ai/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  public async getChatHistory(): Promise<{ success: boolean; data: ChatMessage[] }> {
    return this.request('/ai/chat-history');
  }

  public async clearChatHistory() {
    return this.request('/ai/chat-history', { method: 'DELETE' });
  }

  public async search(q: string): Promise<{ success: boolean; data: SearchResponse }> {
    return this.request(`/search?q=${encodeURIComponent(q)}`);
  }

  // Module 4: Metrics, Observability, Logs & Diagnostics
  public async getMetricsJson(): Promise<{ success: boolean; data: SystemMetrics }> {
    return this.request('/metrics/json');
  }

  public async getPrometheusText(): Promise<string> {
    const res = await fetch('/api/metrics');
    return res.text();
  }

  public async getLogs(): Promise<{ success: boolean; data: LogEntry[] }> {
    return this.request('/logs');
  }

  public async runDiagnostics(): Promise<{ success: boolean; overallStatus: string; tests: any[] }> {
    return this.request('/diagnostics');
  }

  public async getSwaggerJson(): Promise<any> {
    return this.request('/docs/json');
  }
}

export const api = new ApiClient();
