import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  Sparkles,
  Clock,
  Layers,
  BarChart2,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { SearchResponse } from '../types/client.js';
import { api } from '../services/apiClient.js';

export const IntelligenceSearchView: React.FC = () => {
  const [query, setQuery] = useState('MediaTek Dimensity 9400 chipset specs & market trends');
  const [isSearching, setIsSearching] = useState(false);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const res = await api.search(query);
      if (res.success) {
        setSearchData(res.data);
      }
    } catch (err: any) {
      alert(`Search aggregation failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const presetQueries = [
    'MediaTek Dimensity 9400 chipset specs & market trends',
    'Current regional weather forecast and 5-day outlook',
    'Global semiconductor and mobile silicon market share analysis',
    'On-device generative AI NPU hardware benchmarks',
  ];

  return (
    <div className="space-y-4 p-3 lg:p-4">
      {/* Search Header */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex items-center space-x-2 mb-1">
          <Globe className="h-4 w-4 text-cyan-400" />
          <h2 className="font-tech text-sm font-bold tracking-wider text-white uppercase">
            Web Scraping & Search Aggregation Pipeline
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mb-3">
          Google Search Grounding &bull; Live Telemetry Extraction &bull; Dynamic LLM Prompt Context Injection
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1.5 focus-within:border-cyan-500 transition-all">
            <Search className="h-3.5 w-3.5 text-cyan-400 ml-1.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query to harvest and synthesize live intelligence..."
              disabled={isSearching}
              className="flex-1 bg-transparent px-2 py-0.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="flex items-center space-x-1.5 rounded bg-cyan-600 px-3 py-1 text-[10px] font-mono font-bold text-white uppercase hover:bg-cyan-500 transition-colors disabled:opacity-40 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
            >
              <span>{isSearching ? 'AGGREGATING...' : 'FETCH LIVE INTEL'}</span>
            </button>
          </div>
        </form>

        {/* Quick query presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pt-2 border-t border-slate-800 scrollbar-none">
          <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap uppercase font-bold">PRESETS:</span>
          {presetQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                setTimeout(() => handleSearch(), 50);
              }}
              className="rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Results & Prompt Window Context Inspector */}
      {searchData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* AI Synthesized Context (Injected into Prompt Window) */}
          <div className="lg:col-span-12 rounded-lg border border-cyan-500/30 bg-slate-900/50 p-3.5 backdrop-blur-xl border-l-2 border-l-cyan-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <h3 className="font-tech text-xs font-bold text-cyan-300 uppercase">
                  Synthesized Context (Injected into LLM Prompt Window)
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-cyan-400" /> {searchData.timeTakenMs}ms
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 text-cyan-400" /> {searchData.totalResults} Sources
                </span>
              </div>
            </div>

            <div className="rounded border border-slate-800 bg-slate-950 p-3 text-xs font-sans text-slate-200 leading-relaxed">
              {searchData.aiSynthesizedContext}
            </div>
          </div>

          {/* Scraped & Grounded Search Sources */}
          <div className="lg:col-span-12 space-y-2.5">
            <h3 className="font-tech text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              Verified Live Data Sources ({searchData.results.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchData.results.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400 mb-1">
                      <span className="truncate max-w-[180px]">{item.source}</span>
                      <span className="text-slate-500">#{index + 1}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 hover:text-cyan-300 transition-colors mb-1.5 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 font-sans line-clamp-3 mb-2.5">
                      {item.snippet}
                    </p>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] font-mono text-cyan-400 hover:bg-slate-800 transition-colors mt-auto"
                  >
                    <span>Inspect Raw Source</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
