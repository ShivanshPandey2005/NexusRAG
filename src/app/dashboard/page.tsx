'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Database, Sparkles, Activity, ShieldCheck, Zap,
  TrendingUp, Terminal, Play, RotateCw, AlertTriangle, ArrowRight,
  Target, Layers, Network, Clock, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getStoredDocs, getStoredKBs, getStoredQueries, KnowledgeBase, Document, QueryLog } from '@/lib/db-mock';

// Token usage dummy data
const tokenData = [
  { name: '10:00', inputTokens: 4200, outputTokens: 850, cachedTokens: 1200 },
  { name: '11:00', inputTokens: 5800, outputTokens: 1100, cachedTokens: 1800 },
  { name: '12:00', inputTokens: 7400, outputTokens: 1420, cachedTokens: 2500 },
  { name: '13:00', inputTokens: 6200, outputTokens: 1210, cachedTokens: 2100 },
  { name: '14:00', inputTokens: 8100, outputTokens: 1680, cachedTokens: 3100 },
  { name: '15:00', inputTokens: 9300, outputTokens: 1950, cachedTokens: 3800 },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [queriesCount, setQueriesCount] = useState(2420);
  
  // Real-time log streamer state
  const [liveLogs, setLiveLogs] = useState<string[]>([
    '[SYSTEM] NexusRAG Supervisor node listening...',
    '[PII] Masking filter compiled: SSN/Emails/Keys active',
    '[CACHE] Semantic cache synced with Redis DB #0'
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate real-time log streamer and metric fluctuations
  useEffect(() => {
    if (!mounted) return;

    const agents = ['Planner', 'Retriever', 'Reranker', 'Reasoner', 'Critic', 'Writer'];
    const actions = [
      'analyzing query bounds', 
      'querying Qdrant dense vector index', 
      'RRF rank fusion completed', 
      'applying LLMLingua compression',
      'groundedness checks passed (100%)',
      'synthesizing markdown citations'
    ];

    const interval = setInterval(() => {
      // Fluctuate query count slightly
      setQueriesCount(prev => prev + Math.floor(Math.random() * 3));

      // Append random agent log
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString();
      
      setLiveLogs(prev => {
        const next = [...prev, `[${timestamp}] [${randomAgent.toUpperCase()}] ${randomAction}`];
        // Keep last 15 logs
        return next.slice(-15);
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Clock className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up select-none max-w-[1600px] mx-auto text-left">
      
      {/* Title with glowing Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Cpu className="w-5 h-5 text-primary mr-2.5 animate-pulse" />
            AI Operations Command Center
          </h1>
          <p className="text-xs text-muted mt-0.5">Real-time telemetry, routing architectures, and quality metrics of NexusRAG.</p>
        </div>
        <div className="flex items-center space-x-3 text-xs bg-[#0b0b14] border border-[#27274a] px-3.5 py-1.5 rounded-lg shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
          </span>
          <span className="text-gray-300 font-semibold font-mono text-[10px]">VECTOR INDEX ACTIVE</span>
          <span className="text-gray-500">|</span>
          <span className="text-primary font-mono text-[10px]">CORS: ALLOW ALL</span>
        </div>
      </div>

      {/* TOP ROW: DIAGOSTICS GAUGES GRID (Do not look generic) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* RAG Quality Score Radial Gauge */}
        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">RAG Quality Score</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white tracking-tight">98.4%</span>
              <span className="text-[10px] text-accent-emerald font-semibold font-mono">+0.2%</span>
            </div>
            <span className="text-[9px] text-muted block">Faithfulness & answer relevance</span>
          </div>
          {/* Radial visual indicator */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#6366f1" strokeWidth="4" fill="transparent" strokeDasharray="138" strokeDashoffset="22" strokeLinecap="round" className="animate-pulse" />
            </svg>
            <span className="absolute text-[8px] font-mono font-bold text-primary">98.4</span>
          </div>
        </div>

        {/* Hallucination Score Radial Gauge */}
        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Hallucination Index</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-white tracking-tight">0.012</span>
              <span className="text-[10px] text-accent-emerald font-semibold font-mono">-0.004</span>
            </div>
            <span className="text-[9px] text-muted block">Validator Groundedness ratio</span>
          </div>
          {/* Radial indicator */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="22" stroke="#10b981" strokeWidth="4" fill="transparent" strokeDasharray="138" strokeDashoffset="128" strokeLinecap="round" />
            </svg>
            <span className="absolute text-[8px] font-mono font-bold text-accent-emerald">LOW</span>
          </div>
        </div>

        {/* Semantic Cache Hit Rate Card */}
        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Semantic Cache Hits</span>
            <Zap className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white tracking-tight">34.2%</span>
            <span className="text-[9px] text-muted block mt-0.5">Redis bypass vector hits</span>
          </div>
        </div>

        {/* Vector Search Health Card */}
        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Vector search health</span>
            <Database className="w-3.5 h-3.5 text-accent-amber animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white tracking-tight">100%</span>
            <span className="text-[9px] text-accent-emerald font-semibold block mt-0.5">All Qdrant nodes operational</span>
          </div>
        </div>

        {/* Dynamic query count */}
        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60 flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Queries Processed</span>
            <Activity className="w-3.5 h-3.5 text-accent-rose animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-black text-white tracking-tight">{queriesCount.toLocaleString()}</span>
            <span className="text-[9px] text-muted block mt-0.5">Real-time streaming queries</span>
          </div>
        </div>

      </div>

      {/* CORE COMMAND VIEWPORT: INTERACTIVE FLOWS MAPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CENTER VIEWPORT: PIPELINE VISUALIZATION & QUERY FLOW MAP (Span 2) */}
        <div className="lg:col-span-2 glass-panel rounded-xl border-white/5 flex flex-col h-[480px]">
          {/* Tab Navigation header */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#09090c]/40">
            <div className="flex space-x-6 text-xs font-bold uppercase tracking-wider">
              <button 
                onClick={() => setActiveTab('pipeline')}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'pipeline' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Ingestion Pipeline Flow
              </button>
              <button 
                onClick={() => setActiveTab('query')}
                className={`py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'query' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Retrieval Pipeline Query Map
              </button>
            </div>
            <div className="text-[10px] text-muted font-mono hidden md:block">
              STATE DIAGRAM ENGINE v1.1
            </div>
          </div>

          {/* TAB 1: INGESTION PIPELINE FLOW VISUALIZATION (Animated SVG nodes) */}
          {activeTab === 'pipeline' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#040407]/30">
              <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>
              
              <svg className="w-full h-full max-w-[720px] max-h-[300px]" viewBox="0 0 700 260">
                {/* Arrow markers */}
                <defs>
                  <marker id="arrow-glow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                  </marker>
                </defs>

                {/* Animated Pulsing Paths */}
                <path d="M 100 130 L 220 130" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" className="animate-[shimmer_20s_linear_infinite]" />
                <path d="M 220 130 L 360 80" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 220 130 L 360 180" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 360 80 L 520 130" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 360 180 L 520 130" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 520 130 L 640 130" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />

                {/* Draw Nodes */}
                {/* Node 1: Files Source */}
                <g transform="translate(40, 100)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="#09090c" stroke="#1f1f2e" strokeWidth="1.5" />
                  <circle cx="15" cy="18" r="3.5" fill="#6366f1" className="animate-pulse" />
                  <text x="24" y="22" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">RAW FILES</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">PDF, DOCX, TXT</text>
                </g>

                {/* Node 2: Parsers */}
                <g transform="translate(170, 100)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="#09090c" stroke="#6366f1" strokeWidth="1.5" />
                  <circle cx="15" cy="18" r="3.5" fill="#6366f1" className="animate-pulse" />
                  <text x="24" y="22" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">PARSER ENGINE</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">Metadata Extr.</text>
                </g>

                {/* Node 3A: Dense Embedding */}
                <g transform="translate(310, 50)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="#09090c" stroke="#a855f7" strokeWidth="1.5" />
                  <circle cx="15" cy="18" r="3.5" fill="#a855f7" />
                  <text x="24" y="22" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">DENSE EMBEDD.</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">OpenAI (1536d)</text>
                </g>

                {/* Node 3B: Sparse BM25 */}
                <g transform="translate(310, 150)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="#09090c" stroke="#a855f7" strokeWidth="1.5" />
                  <circle cx="15" cy="18" r="3.5" fill="#a855f7" />
                  <text x="24" y="22" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">SPARSE ENCODER</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">BM25 Hashed</text>
                </g>

                {/* Node 4: Qdrant Index */}
                <g transform="translate(470, 100)">
                  <rect x="0" y="0" width="100" height="60" rx="8" fill="#09090c" stroke="#06b6d4" strokeWidth="1.5" />
                  <circle cx="15" cy="18" r="3.5" fill="#06b6d4" className="animate-pulse" />
                  <text x="24" y="22" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">QDRANT HYBRID</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">Dense & Sparse</text>
                </g>

                {/* Node 5: Target Output */}
                <g transform="translate(600, 100)">
                  <rect x="0" y="0" width="90" height="60" rx="8" fill="#09090c" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="15" cy="18" r="3.5" fill="#10b981" />
                  <text x="24" y="22" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">VECTOR DB</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">Ready (Active)</text>
                </g>
              </svg>

              <div className="flex space-x-6 text-[10px] text-muted border-t border-white/5 pt-4 w-full justify-center">
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#6366f1] rounded-full mr-2"></span>Step 1: Document Parsing</span>
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full mr-2"></span>Step 2: Dual Vector Splitting</span>
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full mr-2"></span>Step 3: Upsert & Indexing</span>
              </div>
            </div>
          )}

          {/* TAB 2: QUERY FLOW MAP */}
          {activeTab === 'query' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#040407]/30">
              <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>

              <svg className="w-full h-full max-w-[720px] max-h-[300px]" viewBox="0 0 700 260">
                {/* Paths */}
                <path d="M 80 130 L 190 130" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" className="animate-[shimmer_15s_linear_infinite]" />
                <path d="M 190 130 L 310 80" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 190 130 L 310 180" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 310 80 L 440 130" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 310 180 L 440 130" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />
                <path d="M 440 130 L 560 130" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow-glow)" />

                {/* Nodes */}
                {/* Node 1: User Query */}
                <g transform="translate(10, 100)">
                  <rect x="0" y="0" width="80" height="60" rx="8" fill="#09090c" stroke="#1f1f2e" strokeWidth="1.5" />
                  <text x="12" y="25" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">USER QUERY</text>
                  <text x="12" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">"What is BSA?"</text>
                </g>

                {/* Node 2: Planner */}
                <g transform="translate(130, 100)">
                  <rect x="0" y="0" width="90" height="60" rx="8" fill="#09090c" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="15" y="25" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">1. EXPANSION</text>
                  <text x="15" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">HyDE / PII Redac.</text>
                </g>

                {/* Node 3A: Dense Match */}
                <g transform="translate(260, 50)">
                  <rect x="0" y="0" width="90" height="60" rx="8" fill="#09090c" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="12" y="25" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">DENSE MATCH</text>
                  <text x="12" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">Cosine similarity</text>
                </g>

                {/* Node 3B: Sparse Match */}
                <g transform="translate(260, 150)">
                  <rect x="0" y="0" width="90" height="60" rx="8" fill="#09090c" stroke="#06b6d4" strokeWidth="1.5" />
                  <text x="12" y="25" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">SPARSE MATCH</text>
                  <text x="12" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">BM25 index</text>
                </g>

                {/* Node 4: Fusion & Rerank */}
                <g transform="translate(390, 100)">
                  <rect x="0" y="0" width="90" height="60" rx="8" fill="#09090c" stroke="#10b981" strokeWidth="1.5" />
                  <text x="12" y="25" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">2. FUSION (RRF)</text>
                  <text x="12" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">Cohere Rerank v3</text>
                </g>

                {/* Node 5: Reasoner */}
                <g transform="translate(520, 100)">
                  <rect x="0" y="0" width="90" height="60" rx="8" fill="#09090c" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="12" y="25" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">3. SYNTHESIS</text>
                  <text x="12" y="42" fill="#71717a" fontSize="7" fontFamily="monospace">Grounded response</text>
                </g>
              </svg>

              <div className="flex space-x-6 text-[10px] text-muted border-t border-white/5 pt-4 w-full justify-center">
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full mr-2"></span>Expansion Phase</span>
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#06b6d4] rounded-full mr-2"></span>Qdrant Retrieval</span>
                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#10b981] rounded-full mr-2"></span>Fusion & Synthesis</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT VIEWPORT: LIVE AGENT LOG TERMINAL (Datadog style) */}
        <div className="glass-panel p-5 rounded-xl border-white/5 flex flex-col h-[480px] justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <Terminal className="w-4 h-4 text-accent-emerald mr-2" />
                Live Agent Activity Feed
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            </div>
            <p className="text-[10px] text-muted text-left">Streaming logs directly from LangGraph agent supervisor orchestration nodes.</p>
          </div>

          <div className="terminal-view p-3 flex-1 my-4 overflow-y-auto text-left select-text scrollbar-thin text-[9px] space-y-1.5 font-mono">
            {liveLogs.map((log, idx) => {
              let tagColor = 'text-muted';
              if (log.includes('PLANNER')) tagColor = 'text-accent';
              else if (log.includes('RETRIVER') || log.includes('RETRIEVAL')) tagColor = 'text-accent-cyan';
              else if (log.includes('CRITIC')) tagColor = 'text-accent-amber';
              else if (log.includes('REASONER')) tagColor = 'text-accent-rose';
              else if (log.includes('SYSTEM')) tagColor = 'text-primary';
              else if (log.includes('CACHE')) tagColor = 'text-accent-emerald';

              return (
                <div key={idx} className="flex items-start space-x-1">
                  <span className="text-gray-700 shrink-0 select-none">&gt;</span>
                  <span className="text-gray-300 leading-relaxed break-all">
                    {log.split(']')[0] + ']'} <strong className={tagColor}>{log.split(']')[1]?.split(' ')[1] || ''}</strong> {log.split(']')[1]?.split(' ').slice(2).join(' ') || ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[9.5px] text-muted border-t border-white/5 pt-3 flex items-center justify-between">
            <span className="flex items-center">
              <Zap className="w-3.5 h-3.5 text-accent mr-1.5 animate-pulse" />
              Stream active
            </span>
            <span className="font-mono text-[9px]">2800ms pooling interval</span>
          </div>
        </div>

      </div>

      {/* LOWER COMMAND GRID: METRICS & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TOKEN MONITOR CHART (Span 2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border-white/5 h-[320px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Token Burn Rate Monitor</h3>
              <p className="text-xs text-muted mt-0.5">Track context input, reasoning outputs, and cached token efficiencies.</p>
            </div>
            <div className="flex space-x-3 text-[10px] font-medium">
              <span className="flex items-center text-primary"><span className="w-2 h-2 rounded-full bg-primary mr-1.5"></span>Input</span>
              <span className="flex items-center text-accent"><span className="w-2 h-2 rounded-full bg-accent mr-1.5"></span>Output</span>
              <span className="flex items-center text-accent-cyan"><span className="w-2 h-2 rounded-full bg-accent-cyan mr-1.5"></span>Cached</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="inputGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outputGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="inputTokens" stroke="#6366f1" fillOpacity={1} fill="url(#inputGlow)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="outputTokens" stroke="#a855f7" fillOpacity={1} fill="url(#outputGlow)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="cachedTokens" stroke="#06b6d4" strokeDasharray="3 3" fill="none" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AGENT RUN EXECUTION TIMELINE (Gantt style) */}
        <div className="glass-panel p-6 rounded-xl border-white/5 h-[320px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Agent Execution Latency</h3>
            <p className="text-xs text-muted mt-0.5">Average duration split per agent run in milliseconds.</p>
          </div>

          <div className="space-y-3.5 my-4">
            {[
              { name: '1. Planner', width: '25%', duration: '240ms', color: 'bg-primary' },
              { name: '2. Retriever', width: '45%', duration: '420ms', color: 'bg-accent-cyan' },
              { name: '3. Reranker', width: '35%', duration: '310ms', color: 'bg-accent' },
              { name: '4. Reasoner', width: '80%', duration: '780ms', color: 'bg-accent-rose' },
              { name: '5. Citation', width: '20%', duration: '190ms', color: 'bg-accent-amber' },
              { name: '6. Validator', width: '38%', duration: '340ms', color: 'bg-accent-emerald' },
            ].map((node) => (
              <div key={node.name} className="space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-gray-400 font-semibold">{node.name}</span>
                  <span className="text-white font-bold">{node.duration}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${node.color} rounded-full`} style={{ width: node.width }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-muted border-t border-white/5 pt-3 flex justify-between font-mono">
            <span>Total Latency: 2280ms</span>
            <span className="text-accent-emerald">OPTIMAL</span>
          </div>
        </div>

      </div>

    </div>
  );
}
