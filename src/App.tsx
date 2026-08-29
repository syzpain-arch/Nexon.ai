import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { CommandConsole } from './components/CommandConsole.js';
import { ScheduleView } from './components/ScheduleView.js';
import { MessageGatewayView } from './components/MessageGatewayView.js';
import { IntelligenceSearchView } from './components/IntelligenceSearchView.js';
import { GenerativeMediaView } from './components/GenerativeMediaView.js';
import { ObservabilityView } from './components/ObservabilityView.js';
import { SwaggerDocsView } from './components/SwaggerDocsView.js';
import { DevOpsView } from './components/DevOpsView.js';
import { AlertsDrawer, SystemAlert } from './components/AlertsDrawer.js';
import { ActiveTab, Task, InboundMessage, SystemMetrics, ChatMessage, LogEntry } from './types/client.js';
import { api } from './services/apiClient.js';
import { wsClient } from './services/websocketClient.js';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('console');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<InboundMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Fetch initial data
  const loadTasks = useCallback(async () => {
    try {
      const res = await api.getTasks();
      if (res.success) setTasks(res.data);
    } catch (e) {}
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const res = await api.getMessages();
      if (res.success) setMessages(res.data);
    } catch (e) {}
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      const res = await api.getChatHistory();
      if (res.success) setChatHistory(res.data);
    } catch (e) {}
  }, []);

  const loadMetricsAndLogs = useCallback(async () => {
    try {
      const mRes = await api.getMetricsJson();
      if (mRes.success) setMetrics(mRes.data);
      const lRes = await api.getLogs();
      if (lRes.success) setLogs(lRes.data);
    } catch (e) {}
  }, []);

  // Initial load & WebSocket subscription
  useEffect(() => {
    loadTasks();
    loadMessages();
    loadChatHistory();
    loadMetricsAndLogs();

    // Connect WebSocket
    wsClient.connect();

    const unsubscribe = wsClient.subscribe((type, payload) => {
      if (type === 'CONNECTION_STATUS') {
        setWsConnected(payload.connected);
      } else if (type === 'TASK_CREATED') {
        setTasks((prev) => [payload, ...prev]);
        setAlerts((prev) => [
          {
            id: `alt_${Date.now()}`,
            type: 'SYSTEM',
            title: 'Task Created Autonomously',
            message: payload.title,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else if (type === 'TASK_UPDATED') {
        setTasks((prev) => prev.map((t) => (t.id === payload.id ? payload : t)));
      } else if (type === 'TASK_DELETED') {
        setTasks((prev) => prev.filter((t) => t.id !== payload.id));
      } else if (type === 'TASK_REMINDER') {
        setAlerts((prev) => [
          {
            id: `alt_${Date.now()}`,
            type: 'CRON_REMINDER',
            title: 'Cron Scheduled Task Reminder',
            message: `"${payload.task.title}" is due soon (${new Date(payload.task.dueDate).toLocaleTimeString()})`,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else if (type === 'MESSAGE_RECEIVED') {
        setMessages((prev) => [payload, ...prev]);
        setAlerts((prev) => [
          {
            id: `alt_${Date.now()}`,
            type: 'INBOUND_MESSAGE',
            title: `New Inbound ${payload.platform.toUpperCase()} Transmission`,
            message: `From: ${payload.senderName || payload.sender}: "${payload.content}"`,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else if (type === 'SYSTEM_METRICS') {
        setMetrics(payload);
      }
    });

    // Background interval refresh for telemetry
    const interval = setInterval(() => {
      loadMetricsAndLogs();
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [loadTasks, loadMessages, loadChatHistory, loadMetricsAndLogs]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main HUD Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wsConnected={wsConnected}
        metrics={metrics}
        unreadAlertsCount={alerts.length}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Viewport Router */}
      <main className="w-full max-w-[1600px] mx-auto">
        {activeTab === 'console' && (
          <CommandConsole
            chatHistory={chatHistory}
            onTaskCreated={(task) => setTasks((prev) => [task, ...prev])}
            onRefreshChat={loadChatHistory}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView tasks={tasks} onTasksUpdated={loadTasks} />
        )}

        {activeTab === 'gateways' && (
          <MessageGatewayView messages={messages} onRefreshMessages={loadMessages} />
        )}

        {activeTab === 'search' && <IntelligenceSearchView />}

        {activeTab === 'media' && <GenerativeMediaView />}

        {activeTab === 'observability' && (
          <ObservabilityView
            metrics={metrics}
            logs={logs}
            onRefreshMetrics={loadMetricsAndLogs}
          />
        )}

        {activeTab === 'swagger' && <SwaggerDocsView />}

        {activeTab === 'devops' && <DevOpsView />}
      </main>

      {/* Alerts & Cron Reminders Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        onClearAlerts={() => setAlerts([])}
      />
    </div>
  );
}
