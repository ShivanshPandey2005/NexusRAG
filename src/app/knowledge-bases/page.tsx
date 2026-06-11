'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Trash2, Edit3, Target, CheckCircle2, 
  HelpCircle, ChevronRight, X, Sparkles, Sliders, Check
} from 'lucide-react';
import { getStoredKBs, saveKBs, KnowledgeBase } from '@/lib/db-mock';

export default function KnowledgeBasesPage() {
  const [mounted, setMounted] = useState(false);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-large');
  const [vectorDb, setVectorDb] = useState('Qdrant Cloud');
  const [chunkSize, setChunkSize] = useState(400);
  const [chunkOverlap, setChunkOverlap] = useState(80);
  const [hierarchicalSummary, setHierarchicalSummary] = useState(true);

  useEffect(() => {
    setMounted(true);
    setKbs(getStoredKBs());
  }, []);

  if (!mounted) return null;

  const handleOpenCreate = () => {
    setEditingKb(null);
    setName('');
    setDescription('');
    setEmbeddingModel('text-embedding-3-large');
    setVectorDb('Qdrant Cloud');
    setChunkSize(400);
    setChunkOverlap(80);
    setHierarchicalSummary(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (kb: KnowledgeBase) => {
    setEditingKb(kb);
    setName(kb.name);
    setDescription(kb.description);
    setEmbeddingModel(kb.embeddingModel);
    setVectorDb(kb.vectorDb);
    setChunkSize(400);
    setChunkOverlap(80);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this knowledge base? All vectorized document chunks will be purged.')) {
      const updated = kbs.filter(kb => kb.id !== id);
      setKbs(updated);
      saveKBs(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKb) {
      // Edit
      const updated = kbs.map(kb => {
        if (kb.id === editingKb.id) {
          return {
            ...kb,
            name,
            description,
            embeddingModel,
            vectorDb
          };
        }
        return kb;
      });
      setKbs(updated);
      saveKBs(updated);
    } else {
      // Create
      const newKb: KnowledgeBase = {
        id: `kb-${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 5)}`,
        name,
        description,
        documentsCount: 0,
        chunkCount: 0,
        embeddingModel,
        vectorDb,
        sizeBytes: 0,
        createdAt: new Date().toISOString(),
        accuracy: 96.5,
        successRate: 98.0
      };
      const updated = [...kbs, newKb];
      setKbs(updated);
      saveKBs(updated);
    }
    setIsModalOpen(false);
  };

  // Text sample to preview chunk boundaries (Enterprise Feature #1: Dynamic Chunk Visualizer)
  const getChunkPreviewText = () => {
    const text = "Transformers replace recurrence with self-attention. The model processes tokens in parallel, mapping semantic vectors across long ranges. This enables slower but deeply grounded reasoning in System 2 agents. A sliding window preserves boundaries and bridges information overlap.";
    
    // Estimate slice boundaries based on chunk size slider
    const splitIndex = Math.min(Math.floor(chunkSize / 3.5), text.length);
    const overlapIndexStart = Math.max(splitIndex - Math.floor(chunkOverlap / 2), 0);
    const overlapIndexEnd = Math.min(splitIndex + Math.floor(chunkOverlap / 2), text.length);

    return {
      part1: text.substring(0, overlapIndexStart),
      overlap: text.substring(overlapIndexStart, overlapIndexEnd),
      part2: text.substring(overlapIndexEnd)
    };
  };

  const previewParts = getChunkPreviewText();

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Knowledge Bases</h1>
          <p className="text-sm text-muted mt-1 font-sans">
            Logical document collection registries with independent embedding models and vector collections.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kbs.map((kb) => {
          // Generate deterministic mock scores based on KB ID
          const accuracyTrend = kb.id.includes('medical') ? [92, 94, 93, 96, 95, 98.5] : [90, 93, 92, 95, 96, 96.5];
          const chunkHealth = kb.id.includes('medical') ? 99.4 : 98.8;
          const dataQuality = kb.id.includes('ai-research') ? 99.1 : 97.5;
          const status = kb.id.includes('medical') ? 'Supervisor Listening' : 'Agent Idle';
          const growthData = kb.id.includes('medical') ? [10, 25, 45, 80, 110, 150] : [15, 30, 60, 95, 120, 240];

          return (
            <div key={kb.id} className="glass-panel p-6 rounded-xl border-white/5 flex flex-col justify-between hover:border-white/10 transition-all group relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-bl-full pointer-events-none" />
              
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{kb.name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[9px] text-muted font-mono">{kb.id}</span>
                        <span className="text-gray-600 font-mono text-[8px]">•</span>
                        <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.2 rounded font-mono font-semibold">
                          {kb.embeddingModel}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(kb)}
                      className="p-1.5 rounded-lg text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      title="Edit Collection"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(kb.id)}
                      className="p-1.5 rounded-lg text-muted hover:bg-accent-rose/10 hover:text-accent-rose transition-colors cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mt-3 leading-relaxed line-clamp-2">{kb.description}</p>
                
                {/* Visual Knowledge Graph Preview Component (Inline SVG concept node networks) */}
                <div className="my-4 p-3 rounded-lg border border-white/5 bg-[#050507] flex flex-col justify-between space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] text-muted font-mono shrink-0">
                    <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 text-accent mr-1 animate-pulse" /> Concept Graph Schema</span>
                    <span className="text-[8px] uppercase tracking-wider text-accent-cyan font-bold">{status}</span>
                  </div>
                  <div className="h-[75px] w-full flex items-center justify-center relative">
                    <svg className="w-full h-full max-h-[70px]" viewBox="0 0 300 70">
                      {/* Drawing mock paths */}
                      <path d="M 40 35 L 100 20 L 160 50 M 100 20 L 220 25 L 260 50 M 160 50 L 220 25" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                      <path d="M 40 35 L 100 20" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" />
                      
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                          <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Concept nodes */}
                      <circle cx="40" cy="35" r="4.5" fill="#6366f1" />
                      <circle cx="100" cy="20" r="3.5" fill="#a855f7" />
                      <circle cx="160" cy="50" r="4.5" fill="#06b6d4" />
                      <circle cx="220" cy="25" r="3.5" fill="#f59e0b" />
                      <circle cx="260" cy="50" r="5" fill="#10b981" />
                    </svg>
                  </div>
                </div>

                {/* Grid of details: Accuracy sparkline, quality, health index */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-muted">
                  
                  {/* Accuracy sparkline */}
                  <div className="p-2.5 rounded-lg border border-white/5 bg-[#050507] flex flex-col justify-between h-[65px]">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                      <span>RAG Accuracy</span>
                      <span className="text-white font-mono">{kb.accuracy}%</span>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="h-6 w-full mt-1">
                      <svg className="w-full h-full" viewBox="0 0 120 25">
                        <path 
                          d={`M 0 25 ${accuracyTrend.map((val, i) => `L ${(i * 120) / (accuracyTrend.length - 1)} ${25 - (val - 85) * 1.5}`).join(' ')}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Growth sparkline bar */}
                  <div className="p-2.5 rounded-lg border border-white/5 bg-[#050507] flex flex-col justify-between h-[65px]">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                      <span>Growth Index</span>
                      <span className="text-white font-mono">+{kb.chunkCount} chk</span>
                    </div>
                    {/* SVG Bar growth */}
                    <div className="h-6 w-full mt-1 flex items-end justify-between px-1">
                      {growthData.map((val, i) => (
                        <div 
                          key={i} 
                          className="w-2 bg-primary/40 rounded-t-sm hover:bg-primary transition-all cursor-help"
                          style={{ height: `${(val / Math.max(...growthData)) * 100}%` }}
                          title={`Chunks: ${val}`}
                        />
                      ))}
                    </div>
                  </div>

                </div>

                {/* Score meters: Health Index and Data Quality indexes */}
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-muted">
                  <div className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.01]">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">CHUNK HEALTH</span>
                    <span className="text-accent-emerald font-bold font-mono">{chunkHealth}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.01]">
                    <span className="text-[9px] font-mono text-gray-500 uppercase">DATA QUALITY</span>
                    <span className="text-accent-cyan font-bold font-mono">{dataQuality}%</span>
                  </div>
                </div>

              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-muted font-mono">
                <span>Vector DB: Qdrant Index</span>
                <span>Last Indexed: 2 hours ago</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99] flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-[850px] glass-panel rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
            {/* Left Column: Form config */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto border-r border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {editingKb ? 'Configure Collection' : 'Register New Collection'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 uppercase block">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Legal Compliance Archive"
                    className="w-full py-2 px-3 rounded-lg glass-input text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 uppercase block">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of the collection scope..."
                    className="w-full py-2 px-3 rounded-lg glass-input text-sm h-16 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300 uppercase block">Embedding Engine</label>
                    <select
                      value={embeddingModel}
                      onChange={(e) => setEmbeddingModel(e.target.value)}
                      className="w-full py-2 px-2 rounded-lg glass-input text-xs"
                    >
                      <option value="text-embedding-3-large">OpenAI Large (3072d)</option>
                      <option value="text-embedding-3-small">OpenAI Small (1536d)</option>
                      <option value="cohere-embed-v3">Cohere Multilingual (1024d)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300 uppercase block">Vector Database</label>
                    <select
                      value={vectorDb}
                      onChange={(e) => setVectorDb(e.target.value)}
                      className="w-full py-2 px-2 rounded-lg glass-input text-xs"
                    >
                      <option value="Qdrant Cloud">Qdrant Cloud (Hybrid)</option>
                      <option value="Pinecone Serverless">Pinecone Serverless</option>
                      <option value="Local PGVector">PostgreSQL PGVector</option>
                    </select>
                  </div>
                </div>

                {/* Slices config */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300 flex items-center">
                      <Sliders className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Chunk Size ({chunkSize} tokens)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300">
                      Chunk Overlap ({chunkOverlap} tokens)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="10"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                {/* Enterprise Feature #5: Hierarchical summarization option */}
                <div className="pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white flex items-center">
                      <Sparkles className="w-3.5 h-3.5 text-accent mr-1.5 animate-pulse" />
                      Hierarchical Parent/Child Summary
                    </span>
                    <span className="text-[10px] text-muted">Generate multi-vector summaries to map parents to child sub-chunks</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHierarchicalSummary(!hierarchicalSummary)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      hierarchicalSummary ? 'bg-primary' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      hierarchicalSummary ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-hover text-white rounded-lg text-sm font-semibold mt-6 cursor-pointer active:scale-[0.98]"
                >
                  {editingKb ? 'Save Configuration' : 'Create Collection'}
                </button>
              </form>
            </div>

            {/* Right Column: Interactive Visual Chunker (Enterprise Feature #1) */}
            <div className="w-full md:w-[320px] bg-white/[0.01] p-6 md:p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <Sparkles className="w-4 h-4 text-accent mr-2" />
                  Dynamic Chunk Visualizer
                </h4>
                <p className="text-[10px] text-muted mt-2 leading-relaxed">
                  Real-time preview of sentence segmentation and semantic overlap boundaries using current configuration token ratios.
                </p>

                {/* Simulated text output visually segmented */}
                <div className="mt-6 p-3 rounded-lg border border-white/5 bg-[#050507] font-mono text-[10px] leading-relaxed select-text">
                  <span className="text-accent-emerald bg-accent-emerald/5 px-1 py-0.5 rounded border border-accent-emerald/10 inline-block mb-1">
                    Chunk #1
                  </span>
                  <div className="text-gray-400">
                    {previewParts.part1}
                    <span className="bg-primary/20 text-white font-bold border-x border-primary px-1 rounded-sm relative group cursor-help">
                      {previewParts.overlap}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black border border-white/10 text-white text-[8px] py-0.5 px-1 rounded whitespace-nowrap">
                        Overlap Area
                      </span>
                    </span>
                    {previewParts.part2}
                  </div>
                  <span className="text-accent bg-accent/5 px-1 py-0.5 rounded border border-accent/10 inline-block mt-3">
                    Chunk #2
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-white/5 bg-white/[0.01] text-[10px] text-muted flex items-start space-x-2 mt-6">
                <HelpCircle className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <p className="leading-relaxed">
                  Adjusting chunk sizes changes the amount of context fed to the reasoning agent. Smaller sizes avoid noise; larger sizes preserve continuity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
