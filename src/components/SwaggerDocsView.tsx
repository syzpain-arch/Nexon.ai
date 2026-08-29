import React, { useState } from 'react';
import {
  FileCode,
  Send,
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { swaggerSpec } from '../server/swagger/swaggerSpec.js';

export const SwaggerDocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/tasks');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [requestPayload, setRequestPayload] = useState<string>('{\n  "rawCommand": "Remind me to call John tomorrow at 5 PM"\n}');
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const endpointsList = [
    { path: '/tasks', method: 'GET', desc: 'List All Scheduled Tasks with Filters' },
    { path: '/tasks', method: 'POST', desc: 'Create or Parse Task via NLP' },
    { path: '/ai/command', method: 'POST', desc: 'Execute Autonomous NLP Command & Grounding' },
    { path: '/ai/generate-image', method: 'POST', desc: 'Synthesize Holographic Media' },
    { path: '/search', method: 'GET', desc: 'Live Web Aggregation & Search Pipeline' },
    { path: '/webhooks/whatsapp', method: 'POST', desc: 'Meta WhatsApp Inbound Message Ingest' },
    { path: '/webhooks/instagram', method: 'POST', desc: 'Meta Instagram DM Ingest & Auto-Reply' },
    { path: '/auth/gmail/inbound', method: 'POST', desc: 'Gmail Inbound Email Ingest & Action Parsing' },
    { path: '/metrics', method: 'GET', desc: 'Prometheus Metrics Exposition Endpoint' },
    { path: '/diagnostics', method: 'GET', desc: 'Run Self-Healing Diagnostics Suite' },
  ];

  const handleSelectEndpoint = (path: string, method: any) => {
    setSelectedEndpoint(path);
    setSelectedMethod(method);
    setResponseOutput(null);
    setResponseStatus(null);

    // Provide default template payload
    if (path === '/tasks' && method === 'POST') {
      setRequestPayload(JSON.stringify({ rawCommand: 'Remind me to call John tomorrow at 5 PM' }, null, 2));
    } else if (path === '/ai/command') {
      setRequestPayload(JSON.stringify({ command: 'Analyze quantum telemetry data and schedule review', enableWebSearch: true }, null, 2));
    } else if (path === '/ai/generate-image') {
      setRequestPayload(JSON.stringify({ prompt: 'Glowing holographic arc reactor blueprint' }, null, 2));
    } else if (path === '/webhooks/whatsapp') {
      setRequestPayload(JSON.stringify({ sender: '+15550192', senderName: 'Col. Rhodes', content: 'Send flight clearance code' }, null, 2));
    } else if (path === '/webhooks/instagram') {
      setRequestPayload(JSON.stringify({ sender: '@stark_fan', senderName: 'Peter Parker', content: 'Mr. Stark, web shooter nozzle update complete!' }, null, 2));
    } else if (path === '/auth/gmail/inbound') {
      setRequestPayload(JSON.stringify({ sender: 'banner@avengers-hq.io', senderName: 'Bruce Banner', subject: 'Gamma spectrum test', content: 'Need to review calibration logs at 10 AM' }, null, 2));
    } else {
      setRequestPayload('');
    }
  };

  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setResponseOutput(null);

    try {
      let url = `/api${selectedEndpoint}`;
      if (selectedEndpoint === '/search' && selectedMethod === 'GET') {
        url = `/api/search?q=Quantum%20reactor%20benchmarks`;
      }

      const options: RequestInit = {
        method: selectedMethod,
        headers: { 'Content-Type': 'application/json' },
      };

      if (['POST', 'PUT', 'DELETE'].includes(selectedMethod) && requestPayload.trim()) {
        options.body = requestPayload;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        setResponseOutput(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setResponseOutput(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4 p-3 lg:p-4">
      {/* Top Banner */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex items-center space-x-2 mb-1">
          <FileCode className="h-4 w-4 text-cyan-400" />
          <h2 className="font-tech text-sm font-bold tracking-wider text-white uppercase">
            OpenAPI 3.0 & Swagger Interactive Spec
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 font-mono">
          Interactive REST Console &bull; Schema Exploration &bull; Live Telemetry Execution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Endpoint Directory */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="font-tech text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            REST Endpoints ({endpointsList.length})
          </h3>
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 font-mono text-xs">
            {endpointsList.map((ep, idx) => {
              const isSelected = selectedEndpoint === ep.path && selectedMethod === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep.path, ep.method)}
                  className={`w-full text-left rounded border p-2 transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 border-l-2 border-l-cyan-400'
                      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className={`rounded px-1 text-[9px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                          : ep.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : ep.method === 'PUT'
                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-slate-300 font-bold text-[11px]">{ep.path}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans truncate">{ep.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Interactive Executor Panel */}
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    selectedMethod === 'GET'
                      ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {selectedMethod}
                </span>
                <span className="font-mono text-xs font-bold text-slate-100">
                  /api{selectedEndpoint}
                </span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={isExecuting}
                className="flex items-center space-x-1 rounded bg-cyan-600 px-3 py-1 text-[10px] font-mono font-bold text-white uppercase hover:bg-cyan-500 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.4)] disabled:opacity-40"
              >
                <Send className="h-3 w-3" />
                <span>{isExecuting ? 'EXECUTING...' : 'TRY IT OUT'}</span>
              </button>
            </div>

            {/* Request Body Payload Editor (if not GET) */}
            {['POST', 'PUT'].includes(selectedMethod) && (
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">
                  REQUEST BODY JSON
                </label>
                <textarea
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  rows={5}
                  className="w-full rounded border border-slate-800 bg-slate-950 p-2 font-mono text-xs text-cyan-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {/* Response Output Console */}
            {responseOutput !== null && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">SERVER RESPONSE:</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      responseStatus && responseStatus < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    STATUS {responseStatus}
                  </span>
                </div>

                <div className="rounded border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-200 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{responseOutput}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
