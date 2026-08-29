import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Calendar,
  Radio,
  Search,
  Image as ImageIcon,
  Activity,
  FileCode,
  Layers,
  Sparkles,
  Bell,
} from 'lucide-react';
import { ActiveTab, SystemMetrics } from '../types/client.js';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  wsConnected: boolean;
  metrics: SystemMetrics | null;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wsConnected,
  metrics,
  unreadAlertsCount,
  onOpenAlerts,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.FC<any>; badge?: string }[] = [
    { id: 'console', label: 'Chat & Assistant', icon: Terminal },
    { id: 'schedule', label: 'Tasks & Schedule', icon: Calendar },
    { id: 'gateways', label: 'Messages & Inbound', icon: Radio },
    { id: 'search', label: 'Search & Market Intel', icon: Search },
    { id: 'media', label: 'AI Visuals & Media', icon: ImageIcon },
    { id: 'observability', label: 'Metrics & Health', icon: Activity },
    { id: 'swagger', label: 'API Reference', icon: FileCode },
    { id: 'devops', label: 'Infrastructure & Tests', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#020617]/95 backdrop-blur-xl">
      {/* Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 border-b border-slate-800/80">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] shrink-0">
            <Sparkles className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-tech uppercase">
                Nexon <span className="text-cyan-400 font-medium">AI</span>
              </h1>
              <span className="px-1.5 py-0.2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded text-[9px] font-mono">
                Gemini Powered
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Autonomous Conversational Assistant
            </p>
          </div>
        </div>

        {/* Clean Status & Controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
            <span>{time}</span>
          </div>

          {/* Connection State */}
          <div
            className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-mono border ${
              wsConnected
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            <span>{wsConnected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Notifications Alert Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
            title="Reminders & Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-bold text-slate-950">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto px-4 py-1.5 scrollbar-none bg-[#020617]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 whitespace-nowrap rounded px-2.5 py-1 text-[11px] transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className={`h-3 w-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[8px] text-cyan-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
