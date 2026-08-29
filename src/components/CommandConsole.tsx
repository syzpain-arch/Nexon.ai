import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle,
  Globe,
  Trash2,
  Volume2,
  VolumeX,
  ShieldCheck,
  TrendingUp,
  Pill,
  Palette,
  Calendar,
  Lock,
} from 'lucide-react';
import { ChatMessage, Task, SearchResultItem } from '../types/client.js';
import { api } from '../services/apiClient.js';

interface CommandConsoleProps {
  chatHistory: ChatMessage[];
  onTaskCreated: (task: Task) => void;
  onRefreshChat: () => void;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  chatHistory,
  onTaskCreated,
  onRefreshChat,
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableWebGrounding, setEnableWebGrounding] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [audioWaveLevel, setAudioWaveLevel] = useState<number[]>([40, 65, 85, 30, 95, 70, 50, 80]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isProcessing]);

  // Audio wave animation when active
  useEffect(() => {
    let interval: any;
    if (isListening || isProcessing) {
      interval = setInterval(() => {
        setAudioWaveLevel((prev) =>
          prev.map(() => Math.floor(Math.random() * 80 + 20))
        );
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isListening, isProcessing]);

  // Voice recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputCommand(transcript);
        handleExecuteCommand(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported or permission denied in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = text.replace(/[*_#`[\]]/g, '').slice(0, 250);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleExecuteCommand = async (commandToRun?: string) => {
    const cmd = (commandToRun || inputCommand).trim();
    if (!cmd || isProcessing) return;

    setInputCommand('');
    setIsProcessing(true);

    try {
      const res = await api.sendAiCommand(cmd, enableWebGrounding);
      if (res.success) {
        if (res.data.taskCreated) {
          onTaskCreated(res.data.taskCreated);
        }
        speakText(res.data.text);
      }
      onRefreshChat();
    } catch (error: any) {
      console.error('Command failed', error);
      onRefreshChat();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = async () => {
    await api.clearChatHistory();
    onRefreshChat();
  };

  const sampleDirectives = [
    { label: '📈 Stock Market Timings & Trends', cmd: 'What are the exact stock market opening and closing timings worldwide?' },
    { label: '🚀 Upcoming IPOs & Listings', cmd: 'What are the upcoming IPOs and newly listed companies this quarter?' },
    { label: '💊 Medication Guide & Safety', cmd: 'What is Acetaminophen and Ibuprofen used for, and what are the safety rules?' },
    { label: '🎨 Logo Design Concept', cmd: 'Generate a creative logo design concept and visual branding description for an AI tech startup.' },
    { label: '🎬 YouTube Script & Thumbnail', cmd: 'Create a high-retention YouTube video script and thumbnail hook for semiconductor chips.' },
    { label: '☀️ Weather Forecast', cmd: "What's the current weather update and weekend forecast?" },
    { label: '⚡ MediaTek Dimensity 9400', cmd: 'Analyze MediaTek Dimensity 9400 architecture, NPU benchmarks, and market trends.' },
    { label: '🔐 Owner Security Verification', cmd: 'Run owner security check and verify exclusive authorization status.' },
  ];

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-3 p-3 lg:p-4">
      {/* Top Controls Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 backdrop-blur-xl">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Nexon Assistant</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-mono">
                  Cloud Synced
                </span>
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 rounded text-[9px]">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                Verified Owner: Alex Rivera
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Autonomous Intelligence &bull; Gemini 3.7 Flash &bull; Exclusive Owner Access
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setEnableWebGrounding(!enableWebGrounding)}
            className={`flex items-center space-x-1.5 rounded border px-2 py-0.5 text-[10px] transition-all ${
              enableWebGrounding
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 font-semibold'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
            title="Real-time web search and live grounding"
          >
            <Globe className="h-3 w-3" />
            <span>Search Grounding: {enableWebGrounding ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex items-center space-x-1.5 rounded border px-2 py-0.5 text-[10px] transition-all ${
              ttsEnabled
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 font-semibold'
                : 'border-slate-800 bg-slate-900 text-slate-500'
            }`}
            title="Toggle Voice Output"
          >
            {ttsEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            <span className="hidden sm:inline">Voice</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden md:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="relative flex-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3 backdrop-blur-xl shadow-inner font-sans">
        <div className="space-y-3">
          {chatHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Hi, I'm Nexon!
              </h3>
              <p className="max-w-lg text-xs text-slate-300 mt-1.5 leading-relaxed">
                Your autonomous, hyper-intelligent assistant powered by Gemini. Ask me about stock market timings & closing prices, upcoming IPOs, medication educational info, logo designs & YouTube video scripts, weather updates, or let me organize your daily schedule.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-cyan-400/90 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exclusive Owner Security Active &bull; Zero Technical Clutter &bull; Instant Processing</span>
              </div>
            </div>
          )}

          {chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-1.5">
                  <div className="rounded border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs text-cyan-300">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-900 border border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3.5 border transition-all ${
                    isUser
                      ? 'bg-slate-900/90 border-slate-700 text-slate-100'
                      : 'bg-slate-900/50 border-slate-800 border-l-2 border-l-cyan-500 text-slate-200 shadow-sm'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-bold text-cyan-400">
                      {isUser ? 'You (Owner)' : 'Nexon'}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                    {msg.text}
                  </div>

                  {/* Extracted Tasks if applicable */}
                  {msg.metadata?.tasksCreated && msg.metadata.tasksCreated.length > 0 && (
                    <div className="mt-2.5 rounded border border-emerald-500/30 bg-slate-950 p-2 text-xs border-l-2 border-l-emerald-500">
                      <div className="flex items-center gap-1 font-semibold text-emerald-300 text-xs mb-0.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Task Added to Schedule</span>
                      </div>
                      {msg.metadata.tasksCreated.map((t) => (
                        <div key={t.id} className="text-[11px] text-slate-300">
                          &bull; {t.title} &bull; {new Date(t.dueDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Sources if applicable */}
                  {msg.metadata?.searchResults && msg.metadata.searchResults.length > 0 && (
                    <div className="mt-2 rounded border border-slate-800 bg-slate-950 p-2 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-slate-400 text-[10px] mb-1">
                        <Globe className="h-3 w-3 text-cyan-400" />
                        <span>Verified Cloud Sources:</span>
                      </div>
                      <div className="space-y-0.5">
                        {msg.metadata.searchResults.slice(0, 2).map((s: SearchResultItem, i: number) => (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-[10px] text-cyan-400 hover:underline truncate"
                          >
                            &bull; {s.title} ({s.source})
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-800 border border-slate-700 text-slate-300">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-900 border border-cyan-500/40 text-cyan-400 animate-pulse">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs text-cyan-300 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Nexon is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
        <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
          Explore:
        </span>
        {sampleDirectives.map((item, i) => (
          <button
            key={i}
            onClick={() => handleExecuteCommand(item.cmd)}
            disabled={isProcessing}
            className="rounded border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-300 whitespace-nowrap hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Bottom Input Bar */}
      <div className="relative">
        {/* Visual Audio Waveform (when listening) */}
        {isListening && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 border border-cyan-500/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <span className="text-[10px] text-cyan-300 font-bold mr-1.5">Listening...</span>
            {audioWaveLevel.map((lvl, idx) => (
              <div
                key={idx}
                className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                style={{ height: `${lvl / 5}px` }}
              />
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand();
          }}
          className="h-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center px-3 sm:px-4 gap-2 sm:gap-3"
        >
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            placeholder="Ask Nexon anything (stock timings, IPOs, medicine guide, logos, YouTube scripts, weather)..."
            disabled={isProcessing}
            className="bg-transparent border-none outline-none text-slate-200 text-xs sm:text-sm flex-1 placeholder-slate-500 font-sans"
          />

          <div className="flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleListening}
              className={`px-2.5 sm:px-3 py-1 rounded text-xs font-semibold transition-colors ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isListening ? 'Stop' : 'Voice'}
            </button>

            <button
              type="submit"
              disabled={!inputCommand.trim() || isProcessing}
              className="flex items-center space-x-1 px-3 sm:px-4 py-1 bg-cyan-600 text-white rounded text-xs font-semibold shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-colors disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="h-3 w-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

