import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Eye,
  Zap,
  Layers,
  Cpu,
  Shield,
  Palette,
} from 'lucide-react';
import { api } from '../services/apiClient.js';

export const GenerativeMediaView: React.FC = () => {
  const [prompt, setPrompt] = useState('Futuristic holographic arc reactor schematic blueprint with glowing cyan power conduits');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{
    id: string;
    prompt: string;
    imageUrl: string;
    timestamp: string;
  }[]>([
    {
      id: 'img_default_1',
      prompt: 'Quantum holographic core reactor blueprint in glowing cyan wireframe',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await api.generateImage(prompt);
      if (res.success) {
        setGeneratedImages((prev) => [
          {
            id: `img_${Date.now()}`,
            prompt: res.data.prompt,
            imageUrl: res.data.imageUrl,
            timestamp: res.data.timestamp,
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const presets = [
    'Futuristic holographic arc reactor schematic blueprint with glowing cyan power conduits',
    'Mark 85 nanotechnology armor HUD display with tactical targeting reticle',
    'Satellite orbital trajectory visualizer in deep space dark mode',
    'Quantum neural network synaptic graph in neon purple and gold',
  ];

  return (
    <div className="space-y-4 p-3 lg:p-4">
      {/* Top Generator Banner */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3.5 backdrop-blur-xl">
        <div className="flex items-center space-x-2 mb-1">
          <ImageIcon className="h-4 w-4 text-cyan-400" />
          <h2 className="font-tech text-sm font-bold tracking-wider text-white uppercase">
            Holographic Media & Schematics Synthesizer
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mb-3">
          Google GenAI Visual Pipeline &bull; Quantum Hologram Schematics &bull; Dynamic UI Canvas Rendering
        </p>

        {/* Prompt Input */}
        <form onSubmit={handleGenerate} className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1.5 focus-within:border-cyan-500 transition-all">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 ml-1.5" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe schematic, holographic blueprint, or visual asset to generate..."
              disabled={isGenerating}
              className="flex-1 bg-transparent px-2 py-0.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center space-x-1.5 rounded bg-cyan-600 px-3 py-1 text-[10px] font-mono font-bold text-white uppercase hover:bg-cyan-500 transition-colors disabled:opacity-40 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
            >
              <span>{isGenerating ? 'SYNTHESIZING...' : 'RENDER HOLOGRAPH'}</span>
            </button>
          </div>
        </form>

        {/* Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pt-2 border-t border-slate-800 scrollbar-none">
          <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap uppercase font-bold">BLUEPRINTS:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                setTimeout(() => handleGenerate(), 50);
              }}
              className="rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 whitespace-nowrap transition-colors"
            >
              {p.slice(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* Generated Gallery Grid */}
      <div className="space-y-2.5">
        <h3 className="font-tech text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase">
          <Palette className="h-3.5 w-3.5 text-cyan-400" />
          Synthesized Holographic Assets ({generatedImages.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {generatedImages.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img
                  src={img.imageUrl}
                  alt={img.prompt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                {/* Overlay actions */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-slate-900/90 text-cyan-300 hover:bg-cyan-600 hover:text-white transition-colors"
                    title="Expand View"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <a
                    href={img.imageUrl}
                    download="jarvis_hologram.png"
                    className="flex h-6 w-6 items-center justify-center rounded bg-slate-900/90 text-cyan-300 hover:bg-cyan-600 hover:text-white transition-colors"
                    title="Export Image"
                  >
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 font-sans line-clamp-2 mb-2 font-medium">
                  &quot;{img.prompt}&quot;
                </p>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-800">
                  <span className="text-cyan-400 font-bold">JARVIS RENDER ENGINE</span>
                  <span>{new Date(img.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Expanded modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl rounded-lg border border-slate-800 bg-slate-900 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Expanded"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto rounded object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:bg-rose-600 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
