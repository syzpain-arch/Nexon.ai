import React, { useState } from 'react';
import {
  Radio,
  Mail,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Inbox,
  Share2,
} from 'lucide-react';
import { InboundMessage } from '../types/client.js';
import { api } from '../services/apiClient.js';

interface MessageGatewayViewProps {
  messages: InboundMessage[];
  onRefreshMessages: () => void;
}

export const MessageGatewayView: React.FC<MessageGatewayViewProps> = ({
  messages,
  onRefreshMessages,
}) => {
  const [activePlatform, setActivePlatform] = useState<'all' | 'whatsapp' | 'gmail' | 'instagram'>('all');
  const [selectedMessage, setSelectedMessage] = useState<InboundMessage | null>(null);
  const [customReplyText, setCustomReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Simulator Form State
  const [simPlatform, setSimPlatform] = useState<'whatsapp' | 'gmail' | 'instagram'>('whatsapp');
  const [simSender, setSimSender] = useState('+1 (415) 890-2341');
  const [simSenderName, setSimSenderName] = useState('Sarah Jenkins');
  const [simSubject, setSimSubject] = useState('MediaTek Dimensity market comparison');
  const [simContent, setSimContent] = useState('Hi Alex, could you send over the latest MediaTek Dimensity benchmark analysis and forecast before 4 PM?');
  const [isSimulating, setIsSimulating] = useState(false);

  const filteredMessages = messages.filter((m) => {
    if (activePlatform === 'all') return true;
    return m.platform === activePlatform;
  });

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simContent.trim() || isSimulating) return;

    setIsSimulating(true);
    try {
      if (simPlatform === 'whatsapp') {
        await api.simulateWhatsAppMessage({
          sender: simSender,
          senderName: simSenderName,
          content: simContent,
        });
      } else if (simPlatform === 'gmail') {
        await api.simulateGmailInbound({
          sender: simSender.includes('@') ? simSender : 'dr.banner@gamma-labs.org',
          senderName: simSenderName,
          subject: simSubject,
          content: simContent,
        });
      } else {
        await api.simulateInstagramDM({
          sender: simSender.startsWith('@') ? simSender : `@${simSender}`,
          senderName: simSenderName,
          content: simContent,
        });
      }

      onRefreshMessages();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendCustomReply = async () => {
    if (!selectedMessage || !customReplyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      if (selectedMessage.platform === 'gmail') {
        await api.sendGmailReply(selectedMessage.id, customReplyText);
      } else {
        // WhatsApp / Instagram direct response update
        alert(`Dispatched response to ${selectedMessage.senderName} on ${selectedMessage.platform.toUpperCase()}`);
      }
      setCustomReplyText('');
      onRefreshMessages();
    } catch (e: any) {
      alert(`Reply error: ${e.message}`);
    } finally {
      setIsSendingReply(false);
    }
  };

  const loadPreset = (type: 'whatsapp' | 'gmail' | 'instagram') => {
    setSimPlatform(type);
    if (type === 'whatsapp') {
      setSimSender('+1 (415) 890-2341');
      setSimSenderName('Col. James Rhodes');
      setSimContent('Tony, need the flight authorization clearance code for the Mojave test flight by 4 PM.');
    } else if (type === 'gmail') {
      setSimSender('dr.banner@gamma-labs.org');
      setSimSenderName('Dr. Bruce Banner');
      setSimSubject('Bio-resonance spectral anomalies detected in sector 4');
      setSimContent('Tony, the latest isotope spectrometry shows unusual harmonic oscillation in the containment bay. Can we schedule an automated diagnostic sweep tomorrow morning?');
    } else {
      setSimSender('@mit_robotics_club');
      setSimSenderName('MIT Robotics Lab');
      setSimContent('Mr. Stark, our student team won the National Autonomous Flight challenge! Thank you for the micro-thruster sponsorship!');
    }
  };

  return (
    <div className="space-y-4 p-3 lg:p-4">
      {/* Top Banner */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <h2 className="font-tech text-sm font-bold tracking-wider text-white uppercase">
                Messaging & Webhook Gateways
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              WhatsApp Meta Cloud Webhook &bull; Gmail OAuth2 Engine &bull; Instagram Graph API DM Automation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshMessages}
              className="flex items-center space-x-1.5 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-mono text-cyan-300 hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Sync Channels</span>
            </button>
          </div>
        </div>

        {/* Platform Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between rounded bg-slate-950 p-2 border border-slate-800 border-l-2 border-l-emerald-500">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-950/80 text-emerald-400">
                <MessageSquare className="h-3 w-3" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">WhatsApp Cloud API</div>
                <div className="text-[9px] font-mono text-emerald-400">Online &bull; /api/webhooks/whatsapp</div>
              </div>
            </div>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center justify-between rounded bg-slate-950 p-2 border border-slate-800 border-l-2 border-l-cyan-500">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-950/80 text-cyan-400">
                <Mail className="h-3 w-3" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">Gmail Gateway</div>
                <div className="text-[9px] font-mono text-cyan-400">Connected &bull; stark@avengers-hq.io</div>
              </div>
            </div>
            <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
          </div>

          <div className="flex items-center justify-between rounded bg-slate-950 p-2 border border-slate-800 border-l-2 border-l-pink-500">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-pink-950/80 text-pink-400">
                <Share2 className="h-3 w-3" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">Instagram Graph API</div>
                <div className="text-[9px] font-mono text-pink-400">Stable &bull; @stark_industries</div>
              </div>
            </div>
            <span className="flex h-1.5 w-1.5 rounded-full bg-pink-400" />
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <h3 className="font-tech text-xs font-bold text-slate-200 uppercase">
              Inbound Transmission Simulator (Test Webhook Gateway)
            </h3>
          </div>
          <div className="flex space-x-1 text-[9px] font-mono">
            <button
              onClick={() => loadPreset('whatsapp')}
              className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-slate-300"
            >
              WhatsApp
            </button>
            <button
              onClick={() => loadPreset('gmail')}
              className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-slate-300"
            >
              Gmail
            </button>
            <button
              onClick={() => loadPreset('instagram')}
              className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-slate-300"
            >
              Instagram
            </button>
          </div>
        </div>

        <form onSubmit={handleSimulateInbound} className="space-y-2.5 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-400 mb-1 text-[10px]">TARGET GATEWAY</label>
              <select
                value={simPlatform}
                onChange={(e) => setSimPlatform(e.target.value as any)}
                className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-[11px]"
              >
                <option value="whatsapp">WhatsApp (Meta Cloud API)</option>
                <option value="gmail">Gmail (Google Workspace OAuth)</option>
                <option value="instagram">Instagram Direct (Graph API)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[10px]">SENDER HANDLE / ADDRESS</label>
              <input
                type="text"
                value={simSender}
                onChange={(e) => setSimSender(e.target.value)}
                placeholder="+15551234 or email"
                className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-[11px]"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 text-[10px]">SENDER DISPLAY NAME</label>
              <input
                type="text"
                value={simSenderName}
                onChange={(e) => setSimSenderName(e.target.value)}
                placeholder="Name"
                className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-[11px]"
              />
            </div>
          </div>

          {simPlatform === 'gmail' && (
            <div>
              <label className="block text-slate-400 mb-1 text-[10px]">EMAIL SUBJECT</label>
              <input
                type="text"
                value={simSubject}
                onChange={(e) => setSimSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none text-[11px]"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 text-[10px]">INBOUND MESSAGE PAYLOAD</label>
            <textarea
              value={simContent}
              onChange={(e) => setSimContent(e.target.value)}
              rows={2}
              placeholder="Enter message body to trigger Jarvis automated intent parsing..."
              className="w-full rounded border border-slate-700 bg-slate-950 p-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none font-sans text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSimulating}
              className="flex items-center space-x-1.5 rounded bg-cyan-600 px-3.5 py-1.5 font-bold text-white text-[10px] font-mono uppercase hover:bg-cyan-500 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)] disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              <span>{isSimulating ? 'TRANSMITTING...' : 'TRIGGER WEBHOOK INGEST & NLP REASONING'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Inbox & Response Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Messages List Column */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-tech text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <Inbox className="h-3.5 w-3.5 text-cyan-400" />
              Inbound Queue ({filteredMessages.length})
            </h3>
            {/* Filter Pills */}
            <div className="flex space-x-1 text-[10px] font-mono">
              {(['all', 'whatsapp', 'gmail', 'instagram'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`rounded px-2 py-0.5 capitalize transition-all ${
                    activePlatform === p ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMessages.length === 0 ? (
              <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-6 text-center text-xs font-mono text-slate-500">
                No inbound transmissions logged for this channel. Use the simulator above to test.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setCustomReplyText(msg.suggestedReply || '');
                    }}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase ${
                            msg.platform === 'whatsapp'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : msg.platform === 'gmail'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                              : 'bg-pink-950 text-pink-400 border border-pink-500/30'
                          }`}
                        >
                          {msg.platform}
                        </span>
                        <span className="font-semibold text-xs text-slate-200">{msg.senderName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {msg.subject && (
                      <div className="text-xs font-medium text-cyan-300 mb-0.5">{msg.subject}</div>
                    )}

                    <p className="text-xs text-slate-300 line-clamp-2 font-sans">{msg.content}</p>

                    {/* Intent Tag */}
                    {msg.parsedIntent && (
                      <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800 text-[9px] font-mono">
                        <span className="text-cyan-400 font-semibold">
                          INTENT: {msg.parsedIntent.intent}
                        </span>
                        {msg.parsedIntent.actionable && (
                          <span className="rounded bg-slate-950 px-1 py-0.2 text-amber-300 border border-slate-800">
                            ACTIONABLE TASK CREATED
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Details & AI Smart Response Dispatcher */}
        <div className="lg:col-span-6">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-xl sticky top-20">
            <h3 className="font-tech text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              Jarvis Intent Analysis & Smart Reply Dispatch
            </h3>

            {selectedMessage ? (
              <div className="space-y-3 text-xs font-mono">
                {/* Message Meta Info */}
                <div className="rounded border border-slate-800 bg-slate-950 p-2.5 space-y-1">
                  <div>
                    <span className="text-slate-500">FROM: </span>
                    <span className="text-slate-200 font-bold">{selectedMessage.senderName}</span>{' '}
                    <span className="text-slate-400">({selectedMessage.sender})</span>
                  </div>
                  <div>
                    <span className="text-slate-500">CHANNEL: </span>
                    <span className="text-cyan-400 uppercase font-bold">{selectedMessage.platform}</span>
                  </div>
                  {selectedMessage.subject && (
                    <div>
                      <span className="text-slate-500">SUBJECT: </span>
                      <span className="text-slate-200">{selectedMessage.subject}</span>
                    </div>
                  )}
                  <div className="pt-1.5 text-slate-300 font-sans text-xs border-t border-slate-800 mt-1.5">
                    &quot;{selectedMessage.content}&quot;
                  </div>
                </div>

                {/* Parsed Intent Breakdown */}
                {selectedMessage.parsedIntent && (
                  <div className="rounded border border-cyan-500/30 bg-slate-950 p-2.5 space-y-1.5 border-l-2 border-l-cyan-500">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold text-[10px]">NLP INTENT CLASSIFICATION</span>
                      <span className="text-emerald-400 font-bold text-[10px]">
                        {Math.round((selectedMessage.parsedIntent.confidence || 0.95) * 100)}% CONFIDENCE
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Intent Code: <code className="text-cyan-400">{selectedMessage.parsedIntent.intent}</code>
                    </div>
                    {selectedMessage.parsedIntent.extractedTask && (
                      <div className="rounded bg-slate-900 p-1.5 border border-slate-800 text-[10px] text-slate-300">
                        <div className="text-cyan-300 font-semibold mb-0.5">Automated Task Extracted:</div>
                        <div>&bull; {selectedMessage.parsedIntent.extractedTask.title}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Drafted Contextual Reply */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[10px]">
                    JARVIS AUTONOMOUS CONTEXTUAL REPLY (EDITABLE)
                  </label>
                  <textarea
                    value={customReplyText}
                    onChange={(e) => setCustomReplyText(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-slate-100 focus:border-cyan-500 focus:outline-none font-sans text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Status: <span className="text-emerald-400 uppercase font-bold">{selectedMessage.status}</span>
                  </span>
                  <button
                    onClick={handleSendCustomReply}
                    disabled={isSendingReply || !customReplyText.trim()}
                    className="flex items-center space-x-1.5 rounded bg-cyan-600 px-3.5 py-1.5 font-bold text-white text-[10px] uppercase font-mono hover:bg-cyan-500 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)] disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" />
                    <span>{isSendingReply ? 'DISPATCHING...' : 'DISPATCH REPLY'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded border border-slate-800 bg-slate-950 p-8 text-center text-xs font-mono text-slate-500">
                Select an inbound message from the queue to inspect intent telemetry and formulate contextual responses.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
