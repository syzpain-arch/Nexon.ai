import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Radio,
  X,
  Trash2,
  Zap,
} from 'lucide-react';

export interface SystemAlert {
  id: string;
  type: 'CRON_REMINDER' | 'INBOUND_MESSAGE' | 'AI_STATUS' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
}

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onClearAlerts: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearAlerts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm h-full bg-slate-950 border-l border-slate-800 p-4 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Bell className="h-4 w-4 text-cyan-400" />
              <h3 className="font-tech text-xs font-bold text-slate-100 uppercase">
                System Alerts & Reminders
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="mt-3 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-[11px]">
                No active notifications or scheduled reminders in queue.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`rounded border p-2.5 transition-all ${
                    alt.type === 'CRON_REMINDER'
                      ? 'border-amber-500/30 bg-slate-900/60 border-l-2 border-l-amber-500'
                      : alt.type === 'INBOUND_MESSAGE'
                      ? 'border-cyan-500/30 bg-slate-900/60 border-l-2 border-l-cyan-500'
                      : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                    <span
                      className={`rounded px-1 py-0.2 font-bold uppercase text-[8px] ${
                        alt.type === 'CRON_REMINDER'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : alt.type === 'INBOUND_MESSAGE'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {alt.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">
                      {new Date(alt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-200">{alt.title}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                    {alt.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-500">{alerts.length} Total Alerts</span>
          <button
            onClick={onClearAlerts}
            disabled={alerts.length === 0}
            className="flex items-center space-x-1 text-[10px] font-mono text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
