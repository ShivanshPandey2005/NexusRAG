'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, Search, ShieldCheck, Zap, AlertTriangle, Play, Cpu, 
  Database, Clock, BarChart3, HelpCircle, Code, Layers, FileText, ArrowRight, CheckCircle2, EyeOff
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getStoredQueries, QueryLog } from '@/lib/db-mock';

// Mock models usage statistics
const modelUsageData = [
  { name: 'GPT-4o (Reasoning)', value: 65, color: '#6366f1' },
  { name: 'Claude 3.5 Sonnet (Synthesis)', value: 25, color: '#a855f7' },
  { name: 'cohere-embed-english-v3.0', value: 10, color: '#06b6d4' }
];

// Mock latency trends
const latencyTrendData = [
  { name: '10:00', LLM: 1200, Rerank: 280, Retrieve: 380, Embed: 180 },
  { name: '11:00', LLM: 1400, Rerank: 310, Retrieve: 420, Embed: 190 },
  { name: '12:00', LLM: 1100, Rerank: 260, Retrieve: 350, Embed: 170 },
  { name: '13:00', LLM: 1550, Rerank: 340, Retrieve: 460, Embed: 210 },
  { name: '14:00', LLM: 1300, Rerank: 290, Retrieve: 390, Embed: 185 },
  { name: '15:00', LLM: 1250, Rerank: 275, Retrieve: 375, Embed: 180 },
];

export default function ObservabilityPage() {
  const [mounted, setMounted] = useState(false);
  const [queries, setQueries] = useState<QueryLog[]>([]);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);
  
  // Real-time trace lists
  useEffect(() => {
    setMounted(true);
    const saved = getStoredQueries();
    setQueries(saved);
    if (saved.length > 0) {
      setSelectedTraceId(saved[0].id);
    }
  }, []);

  if (!mounted) return null;

  const selectedTrace = queries.find(q => q.id === selectedTraceId);

  // Compute stats
  const avgLatency = queries.length > 0 
    ? Math.round(queries.reduce((acc, q) => acc + q.latencyMs, 0) / queries.length) 
    : 1840;

  const totalTokens = queries.reduce((acc, q) => acc + (q.tokensUsed || 0), 0) || 12450;
  const totalCost = (queries.reduce((acc, q) => acc + (q.tokensUsed || 0) * 0.000015, 0)).toFixed(4) || "0.186";

  return (
    <div className="space-y-6 animate-slide-up flex flex-col h-[calc(100vh-8.5rem)] text-left select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Activity className="w-5 h-5 text-primary mr-2.5" />
            AI Observability Console
          </h1>
          <p className="text-xs text-muted mt-0.5">Real-time latency waterfall trace maps, token burn costs, and LLM evaluations.</p>
        </div>
        
        {/* Observability Mode Badge */}
        <div className="flex items-center space-x-3 text-xs bg-[#0b0b14]/80 border border-[#27274a] px-3.5 py-1.5 rounded-lg shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
          </span>
          <span className="text-gray-300 font-semibold font-mono text-[10px]">LANGSMITH AGENT LOGGER ONLINE</span>
          <span className="text-gray-500">|</span>
          <span className="text-primary font-mono text-[10px]">SPAN VERSION: v2</span>
        </div>
      </div>

      {/* TOP AGGREGATES PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Average LLM Latency</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white tracking-tight">{avgLatency}ms</span>
            <span className="text-[10px] text-accent-emerald font-semibold font-mono">-40ms</span>
          </div>
          <span className="text-[9px] text-muted block mt-0.5">P95 latency averages</span>
        </div>

        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Cumulative Run Costs</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white tracking-tight">${totalCost}</span>
            <span className="text-[10px] text-primary font-semibold font-mono">{totalTokens} tkn</span>
          </div>
          <span className="text-[9px] text-muted block mt-0.5">Avg $0.0022 per transaction</span>
        </div>

        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Error Rate</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white tracking-tight">0.02%</span>
            <span className="text-[10px] text-accent-emerald font-semibold font-mono">0.00% err</span>
          </div>
          <span className="text-[9px] text-accent-emerald font-semibold block mt-0.5">All agents healthy</span>
        </div>

        <div className="glass-card p-4 rounded-xl border-[#1e1b4b]/60">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Cache Save Efficiency</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white tracking-tight">34.2% Hits</span>
            <span className="text-[10px] text-accent-cyan font-semibold font-mono">Redis Active</span>
          </div>
          <span className="text-[9px] text-muted block mt-0.5">Saved $1.42 in prompt tokens</span>
        </div>
      </div>

      {/* MAIN LAYOUT SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 items-stretch">
        
        {/* LEFT COLUMN: LIVE RUN TRACES LIST (Span 3) */}
        <div className="xl:col-span-3 glass-panel p-4 rounded-xl border-white/5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center space-x-2 mb-3 shrink-0">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Transaction Runs</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {queries.length > 0 ? (
              queries.map((q) => {
                const isActive = selectedTraceId === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedTraceId(q.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col justify-between cursor-pointer space-y-1.5 ${
                      isActive 
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-gray-400 font-semibold uppercase">{q.kbName}</span>
                      <span className="text-accent-emerald font-bold">{q.latencyMs}ms</span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-white truncate" title={q.query}>
                      {q.query}
                    </h4>

                    <div className="flex justify-between items-center text-[8.5px] text-muted pt-1 border-t border-white/5 font-mono">
                      <span>tkn: {q.tokensUsed}</span>
                      <span>{new Date(q.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-muted">No runs found.</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MODELS & COSTS (Span 1) */}
        <div className="xl:col-span-1 glass-panel p-5 rounded-xl border-white/5 flex flex-col justify-between h-full overflow-y-auto space-y-6">
          
          {/* MODEL INVOCATION SPLIT */}
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center">
              <BarChart3 className="w-4 h-4 text-primary mr-1.5" />
              Model Token Burn Ratios
            </div>
            
            <div className="h-[150px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {modelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '9px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted font-mono">TOTAL</span>
                <span className="text-xs font-bold text-white font-mono">12.4K</span>
              </div>
            </div>

            <div className="space-y-1.5 font-mono text-[8.5px]">
              {modelUsageData.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-400">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                    {entry.name}
                  </span>
                  <span className="text-white font-bold">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* LATENCY METRIC TREND CHART */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="text-[10px] font-bold text-white uppercase tracking-wider">Latency Trend (ms)</div>
            
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyTrendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={8} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '8.5px' }} />
                  <Bar dataKey="LLM" stackId="a" fill="#6366f1" />
                  <Bar dataKey="Rerank" stackId="a" fill="#a855f7" />
                  <Bar dataKey="Retrieve" stackId="a" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex space-x-3 text-[8.5px] justify-center font-mono text-gray-500">
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#6366f1] rounded mr-1"></span>LLM</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#a855f7] rounded mr-1"></span>Rerank</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[#06b6d4] rounded mr-1"></span>Retrieve</span>
            </div>
          </div>

          {/* OBSERVABILITY STATUS */}
          <div className="text-[9px] text-muted border-t border-white/5 pt-4 flex items-center justify-between font-mono shrink-0">
            <span>Server: local 127.0.0.1:8000</span>
            <span>API Version: v1</span>
          </div>

        </div>

      </div>

      {/* RIGHT DRAWER: TRACE TIMELINE WATERFALL (LangSmith style Slide-over) */}
      <div 
        className={`drawer-overlay ${selectedTraceId ? 'open' : ''}`}
        onClick={() => setSelectedTraceId(null)}
      />
      <div className={`drawer-slide-over p-6 flex flex-col justify-between overflow-y-auto ${selectedTraceId ? 'open' : ''}`}>
        {selectedTrace ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trace Waterfall</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9.5px] font-mono text-muted">ID: {selectedTrace.id}</span>
                  <button 
                    onClick={() => setSelectedTraceId(null)}
                    className="text-muted hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spans Waterfall */}
              <div className="space-y-4">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Span Performance</div>
                
                <div className="space-y-4 pt-2 font-mono text-[9px]">
                  {[
                    { name: '1. query_planner_node', span: '180ms', offset: 0, width: 8, color: 'bg-primary' },
                    { name: '2. qdrant_retriever_dense', span: '380ms', offset: 8, width: 16, color: 'bg-accent-cyan' },
                    { name: '3. bm25_retriever_sparse', span: '320ms', offset: 12, width: 14, color: 'bg-accent-cyan' },
                    { name: '4. rrf_fusion_reranker', span: '280ms', offset: 26, width: 12, color: 'bg-accent' },
                    { name: '5. llm_synthesis_reasoner', span: '780ms', offset: 38, width: 34, color: 'bg-accent-rose' },
                    { name: '6. critic_groundedness_critic', span: '310ms', offset: 72, width: 13, color: 'bg-accent-emerald' },
                    { name: '7. response_writer', span: '210ms', offset: 85, width: 10, color: 'bg-accent-amber' },
                  ].map((span, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5 font-semibold text-gray-300 truncate">{span.name.replace('_node', '')}</div>
                      <div className="col-span-2 text-white font-bold text-[8.5px]">{span.span}</div>
                      
                      {/* Bar Container */}
                      <div className="col-span-5 h-4 bg-white/5 rounded relative flex items-center">
                        <div 
                          className={`h-2 ${span.color} rounded-sm absolute opacity-85`}
                          style={{ 
                            left: `${span.offset}%`, 
                            width: `${span.width}%` 
                          }}
                          title={`${span.name}: ${span.span}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Generation Output */}
              <div className="pt-5 border-t border-white/5 space-y-3">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                  <Layers className="w-3.5 h-3.5 text-accent mr-1.5" />
                  Grounded Output Preview
                </div>
                
                <div className="p-3.5 bg-[#050507] border border-white/5 rounded-lg font-mono text-[10px] text-gray-300 leading-relaxed select-text max-h-[160px] overflow-y-auto scrollbar-thin">
                  {selectedTrace.response}
                </div>
              </div>

            </div>

            <div className="text-[10px] text-muted border-t border-white/5 pt-4 flex justify-between font-mono mt-4">
              <span>Trace logs: synced</span>
              <span>Tokens: {selectedTrace.tokensUsed}</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <Activity className="w-8 h-8 text-muted animate-pulse" />
            <p className="text-xs text-muted">Select a transaction trace run on the left to see span breakdown details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
