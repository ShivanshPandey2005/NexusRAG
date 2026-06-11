'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Activity, Clock, ShieldCheck, Target, TrendingUp,
  Cpu, Database, Sparkles, HelpCircle, ArrowUpRight, Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const volumeData = [
  { name: 'Mon', queries: 240, cacheHits: 80 },
  { name: 'Tue', queries: 320, cacheHits: 95 },
  { name: 'Wed', queries: 450, cacheHits: 130 },
  { name: 'Thu', queries: 590, cacheHits: 180 },
  { name: 'Fri', queries: 480, cacheHits: 140 },
  { name: 'Sat', queries: 190, cacheHits: 60 },
  { name: 'Sun', queries: 220, cacheHits: 75 },
];

const latencyData = [
  { name: 'Planner', latency: 240 },
  { name: 'Retriever', latency: 420 },
  { name: 'Reranker', latency: 310 },
  { name: 'Reasoner', latency: 780 },
  { name: 'Citation', latency: 190 },
  { name: 'Validator', latency: 340 },
];

const accuracySuccessData = [
  { name: 'Wk 1', accuracy: 96.2, success: 97.4 },
  { name: 'Wk 2', accuracy: 96.8, success: 98.0 },
  { name: 'Wk 3', accuracy: 97.4, success: 98.2 },
  { name: 'Wk 4', accuracy: 97.8, success: 98.5 },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Clock className="w-6 h-6 text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Analytics</h1>
        <p className="text-sm text-muted mt-1">Trace retrieval performance, calculate api costs, and inspect embedding health indexes.</p>
      </div>

      {/* TOP ROW: ENTERPRISE DIAGNOSTIC CARDS (Enterprise Features 6 & 7) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Semantic Cache Hit Rates (Enterprise Feature #7) */}
        <div className="glass-panel p-6 rounded-xl border-white/5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
              <Zap className="w-3.5 h-3.5 text-accent-cyan mr-1.5 animate-pulse" />
              Semantic Cache Hit Ratio
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">34.2%</h3>
            <p className="text-[10px] text-muted">Redis cached searches saved <strong className="text-accent-emerald font-mono">$184.20</strong> in API fees this week.</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Index Drift Monitoring (Enterprise Feature #6) */}
        <div className="glass-panel p-6 rounded-xl border-white/5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
              <Database className="w-3.5 h-3.5 text-accent-amber mr-1.5" />
              Index Cluster Drift (Stability)
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">0.024</h3>
            <p className="text-[10px] text-muted">Stable distributions. No semantic retraining required.</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Cost Tracking */}
        <div className="glass-panel p-6 rounded-xl border-white/5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Token Cost Burn Rate</div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">$42.84<span className="text-xs text-muted font-normal"> / day</span></h3>
            <p className="text-[10px] text-muted">Estimated cost based on 2.4M input and 410k output tokens.</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Query Volume & Cache hits */}
        <div className="glass-panel p-6 rounded-xl border-white/5 h-[340px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Daily Query Volume</h3>
            <p className="text-xs text-muted mb-4">Breakdown of total platform queries compared with cache hits.</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="qVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cHit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="queries" stroke="#6366f1" fillOpacity={1} fill="url(#qVol)" strokeWidth={2} />
                <Area type="monotone" dataKey="cacheHits" stroke="#06b6d4" fillOpacity={1} fill="url(#cHit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Latency per Agent Stage */}
        <div className="glass-panel p-6 rounded-xl border-white/5 h-[340px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Execution Latency by Agent Stage</h3>
            <p className="text-xs text-muted mb-4">Average latency in milliseconds spent per step in the LangGraph loop.</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }} />
                <Bar dataKey="latency" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Retrieval Accuracy vs Search Success Rate */}
        <div className="glass-panel p-6 rounded-xl border-white/5 h-[340px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Retrieval Accuracy & Success Rates</h3>
            <p className="text-xs text-muted mb-4">Weekly aggregation of grounded validator accuracy vs pipeline success rates.</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracySuccessData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} domain={[94, 100]} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="success" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Document growth metrics */}
        <div className="glass-panel p-6 rounded-xl border-white/5 h-[340px] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Document & Vector Size Growth</h3>
            <p className="text-xs text-muted mb-4">Monthly accumulation of files parsed and total vectors indexed in database collections.</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={[
                  { name: 'Jan', docs: 12, chunks: 1400 },
                  { name: 'Feb', docs: 24, chunks: 2800 },
                  { name: 'Mar', docs: 36, chunks: 4500 },
                  { name: 'Apr', docs: 42, chunks: 6200 },
                  { name: 'May', docs: 57, chunks: 9400 },
                ]} 
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chunksGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="chunks" stroke="#a855f7" fillOpacity={1} fill="url(#chunksGlow)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
