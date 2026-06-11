'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Sparkles, Database, ShieldAlert, Library, BookOpen, Clock, 
  HelpCircle, ChevronDown, ChevronUp, AlertCircle, RefreshCw, ThumbsUp, ThumbsDown, 
  CheckCircle, ArrowRight, Eye, ShieldCheck, Cpu, Target, Layers, Zap
} from 'lucide-react';
import { getStoredKBs, getStoredQueries, saveQueries, QueryLog, KnowledgeBase } from '@/lib/db-mock';

export default function SearchAskPage() {
  const [mounted, setMounted] = useState(false);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [queries, setQueries] = useState<QueryLog[]>([]);
  const [selectedKb, setSelectedKb] = useState('all');
  
  // Search State
  const [queryInput, setQueryInput] = useState('');
  const [activeQuery, setActiveQuery] = useState<QueryLog | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  // Right side panel active chunk details
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);

  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    setKbs(getStoredKBs());
    const saved = getStoredQueries();
    setQueries(saved);
    if (saved.length > 0) {
      setActiveQuery(saved[0]);
      setStreamingText(saved[0].response);
    }
  }, []);

  if (!mounted) return null;

  const handleSelectHistory = (q: QueryLog) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setActiveQuery(q);
    setStreamingText(q.response);
    setIsSearching(false);
    setActiveSourceIndex(0);
  };

  const handleSuggestedAsk = (text: string) => {
    setQueryInput(text);
    triggerSearch(text);
  };

  const triggerSearch = (text: string) => {
    if (!text.trim()) return;
    
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsSearching(true);
    setStreamingText('');
    setActiveSourceIndex(0);
    
    const targetKbName = selectedKb === 'all' 
      ? (kbs[0]?.name || 'All Databases')
      : (kbs.find(kb => kb.id === selectedKb)?.name || 'Collection');
      
    setTimeout(() => {
      // Custom mock result generation based on query keyword matches
      const isMedical = text.toLowerCase().includes('medical') || text.toLowerCase().includes('patients') || text.toLowerCase().includes('cancer');
      const isHR = text.toLowerCase().includes('hours') || text.toLowerCase().includes('work') || text.toLowerCase().includes('vacation');
      
      let responseContent = '';
      let sources = [];
      
      if (isMedical) {
        responseContent = `According to the oncology guidelines in **Medical Documents** (specifically [oncology_treatment_protocols_2026.docx](doc-oncology)), chemotherapy dosages are strictly calculated based on Body Surface Area (BSA) using the **Mosteller formula**:\n\n$$\\text{BSA} (m^2) = \\sqrt{\\frac{\\text{Height (cm)} \\times \\text{Weight (kg)}}{3600}}$$\n\n### Critical Clinical Parameters:\n1. **Pre-infusion Count:** Absolute Neutrophil Count (ANC) must be $\\ge 1,500/\\mu\\text{L}$ and platelets $\\ge 100,000/\\mu\\text{L}$.\n2. **Pembrolizumab Combination:** Administer fixed 200mg IV dose combined with BSA-calculated chemotherapy cycles.`;
        sources = [
          {
            title: 'oncology_treatment_protocols_2026.docx',
            chunkId: 'doc-oncology#chunk-12',
            score: 0.985,
            snippet: 'Chemotherapy dosing calculates BSA strictly via the Mosteller formula. Baseline count checks mandate ANC >= 1500 and platelets >= 100,000.'
          },
          {
            title: 'oncology_treatment_protocols_2026.docx',
            chunkId: 'doc-oncology#chunk-15',
            score: 0.892,
            snippet: 'Combination therapy with Pembrolizumab requires a static 200mg IV dosing along with BSA weight adjustments for primary agents.'
          }
        ];
      } else if (isHR) {
        responseContent = `Based on the [employee_handbook_2026.md](doc-handbook) in the **Company Knowledge** base, NexusRAG operates remote-first with these requirements:\n\n### Core Hours:\n- The synchronous window is **10:00 AM to 3:00 PM EST**, during which employees are expected to be available for team huddles.\n\n### Core Values:\n1. **Radical Transparency:** Sharing draft work early, documenting design decisions.\n2. **First-Principles Thinking:** Deconstructing issues to baseline truths.\n3. **Extreme Ownership:** Managing projects end-to-end.`;
        sources = [
          {
            title: 'employee_handbook_2026.md',
            chunkId: 'doc-handbook#chunk-2',
            score: 0.978,
            snippet: 'NexusRAG core async window is 10:00 AM to 3:00 PM EST. Core tenets emphasize Radical Transparency, First-Principles, and Extreme Ownership.'
          }
        ];
      } else {
        responseContent = `Based on the **AI Research** database (specifically [attention_is_all_you_need.pdf](doc-transformer)), the Transformer architecture replaces recurrent connections with self-attention. \n\n### Core Tenets:\n1. **Parallelization:** Matrix multiplications map sequences simultaneously rather than sequentially in O(1) operations.\n2. **Positional Encoding:** Sinusoidal signals are added to embeddings to preserve sequence ordering.`;
        sources = [
          {
            title: 'attention_is_all_you_need.pdf',
            chunkId: 'doc-transformer#chunk-1',
            score: 0.942,
            snippet: 'We propose a new sequence transduction architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence entirely.'
          },
          {
            title: 'deep_reasoning_llms_survey.pdf',
            chunkId: 'doc-reasoning#chunk-4',
            score: 0.845,
            snippet: 'System 2 slow-thinking structures utilize process-supervised reinforcement learning (PRMs) to evaluate intermediate reasoning steps.'
          }
        ];
      }

      const mockResult: QueryLog = {
        id: `q-${Math.random().toString(36).substring(2, 6)}`,
        query: text,
        response: responseContent,
        latencyMs: 1220 + Math.floor(Math.random() * 600),
        accuracy: 96.0 + Math.floor(Math.random() * 3),
        timestamp: new Date().toISOString(),
        kbName: targetKbName,
        tokensUsed: 450 + Math.floor(Math.random() * 300),
        steps: [
          {
            agent: 'Query Planner Agent',
            action: 'PII Check & HyDE',
            status: 'completed',
            durationMs: 180,
            logs: ['PII Compliance: Anonymized email structures.', 'HyDE: Formulated conceptual target answer vector.']
          },
          {
            agent: 'Retrieval Agent',
            action: 'Qdrant Fetch',
            status: 'completed',
            durationMs: 380,
            logs: ['Dense match search: 2 matches.', 'Sparse BM25 match search: 3 matches.']
          },
          {
            agent: 'Reranking Agent',
            action: 'RRF & Cohere Rerank',
            status: 'completed',
            durationMs: 280,
            logs: ['Reciprocal Rank Fusion completed.', 'Cohere Rerank english-v3.0 scoring completed.']
          },
          {
            agent: 'Validation Agent',
            action: 'Groundedness Critic',
            status: 'completed',
            durationMs: 310,
            logs: ['Checking claims against source context.', 'Groundedness score: 100% (passed).']
          }
        ],
        sources: sources
      };

      setActiveQuery(mockResult);
      
      let charIdx = 0;
      const fullResponse = mockResult.response;
      setIsSearching(false);
      
      streamIntervalRef.current = setInterval(() => {
        setStreamingText(fullResponse.substring(0, charIdx + 4));
        charIdx += 4;
        if (charIdx >= fullResponse.length) {
          if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
          
          setQueries(prev => {
            const updated = [mockResult, ...prev];
            saveQueries(updated);
            return updated;
          });
        }
      }, 15);
      
    }, 1200);
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    if (!activeQuery) return;
    const updated = queries.map(q => {
      if (q.id === activeQuery.id) return { ...q, feedback: type };
      return q;
    });
    setQueries(updated);
    saveQueries(updated);
    setActiveQuery(prev => prev ? { ...prev, feedback: type } : null);
  };

  const suggestedQuestions = [
    "What is the Mosteller formula calculation rules?",
    "Show company core hours and PTO policies.",
    "What is the self-attention mechanism in Transformers?"
  ];

  const activeSource = activeQuery?.sources[activeSourceIndex];

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-slide-up h-[calc(100vh-8.5rem)] text-left select-none">
      
      {/* 1. LEFT COLUMN: QUERY HISTORY SIDEBAR */}
      <aside className="w-full xl:w-[220px] shrink-0 glass-panel p-4 rounded-xl border-white/5 flex flex-col h-full overflow-hidden">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Searches</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {queries.length > 0 ? (
            queries.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectHistory(q)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all truncate block cursor-pointer ${
                  activeQuery?.id === q.id 
                    ? 'bg-white/10 text-white font-medium border-l-2 border-primary pl-2' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                title={q.query}
              >
                {q.query}
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-[10px] text-muted">
              No recent searches.
            </div>
          )}
        </div>
      </aside>

      {/* 2. CENTER COLUMN: CONVERSATION PANEL */}
      <div className="flex-1 glass-panel rounded-xl border-white/5 flex flex-col h-full overflow-hidden justify-between">
        
        {/* Top Header: Knowledge Base selector */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#09090c]/40">
          <div className="flex items-center space-x-2 text-xs">
            <Library className="w-4 h-4 text-primary" />
            <span className="text-gray-400 font-medium">Search Collection:</span>
            <select
              value={selectedKb}
              onChange={(e) => setSelectedKb(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-bold"
            >
              <option value="all" className="bg-[#09090b]">All Collections</option>
              {kbs.map(kb => (
                <option key={kb.id} value={kb.id} className="bg-[#09090b]">{kb.name}</option>
              ))}
            </select>
          </div>
          <div className="text-[10px] text-muted font-mono">
            PERPLEXITY ENTERPRISE SHELL
          </div>
        </div>

        {/* Scrollable Conversation Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="w-6 h-6 text-primary animate-spin" />
              <div className="text-xs text-muted font-mono animate-pulse">Routing query planner and Qdrant index...</div>
            </div>
          ) : activeQuery ? (
            <div className="space-y-6">
              {/* Query Header */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-muted">
                  U
                </div>
                <h2 className="text-base font-bold text-white tracking-tight mt-0.5">{activeQuery.query}</h2>
              </div>
              
              {/* Answer Content */}
              <div className="flex items-start space-x-3 border-t border-white/5 pt-6">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shrink-0 text-white font-bold text-[10px]">
                  AI
                </div>
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="prose prose-invert max-w-none text-sm text-gray-200 leading-relaxed select-text font-sans whitespace-pre-line">
                    {streamingText}
                  </div>

                  {/* Inline Feedback & analytics */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-muted">
                    <div className="flex space-x-3">
                      <span>Latency: <strong className="text-white font-mono">{activeQuery.latencyMs}ms</strong></span>
                      <span>•</span>
                      <span>Tokens: <strong className="text-white font-mono">{activeQuery.tokensUsed}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleFeedback('positive')}
                        className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                          activeQuery.feedback === 'positive' ? 'text-accent-emerald bg-accent-emerald/10' : ''
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleFeedback('negative')}
                        className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                          activeQuery.feedback === 'negative' ? 'text-accent-rose bg-accent-rose/10' : ''
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* INITIAL STATE: Search console landing */
            <div className="py-20 text-center space-y-10 animate-fade-in max-w-lg mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent mb-4 shadow-lg shadow-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white animate-pulse-glow" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Search</h2>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  Ask semantic questions across your vectorized collections. Results are reranked and evaluated for groundedness.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suggested Queries</div>
                <div className="grid grid-cols-1 gap-2.5">
                  {suggestedQuestions.map((text, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedAsk(text)}
                      className="p-3 text-xs text-gray-300 bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:text-white rounded-lg text-left transition-all cursor-pointer truncate"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Large Search Input */}
        <div className="p-4 border-t border-white/5 bg-[#090812]/40 backdrop-blur-md shrink-0">
          <div className="relative flex items-center bg-[#090811]/60 border border-white/10 rounded-xl px-4 py-3 shadow-lg shadow-black/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && triggerSearch(queryInput)}
              placeholder="Ask follow-up or run new semantic hybrid query..."
              className="w-full bg-transparent text-sm text-white placeholder-muted focus:outline-none font-sans"
            />
            <button
              onClick={() => triggerSearch(queryInput)}
              disabled={isSearching || !queryInput.trim()}
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent hover:from-primary-hover hover:to-accent/90 flex items-center justify-center text-white shrink-0 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 shadow-md shadow-primary/20 active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. RIGHT COLUMN: RETRIEVAL INSIGHTS & SOURCES */}
      <aside className="w-full xl:w-[350px] shrink-0 space-y-6 overflow-y-auto h-full scrollbar-thin pr-1">
        
        {activeQuery ? (
          <div className="space-y-6">
            
            {/* Confidence Score & Quality Card (Enterprise Feature #10) */}
            <div className="glass-panel p-5 rounded-xl border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Retrieval Confidence</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-black text-white tracking-tight">{activeQuery.accuracy}%</span>
                  <span className="text-[9px] text-accent-emerald font-semibold font-mono">GROUNDED</span>
                </div>
                <span className="text-[9px] text-muted block">Faithfulness evaluation score</span>
              </div>
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.03)" strokeWidth="3.5" fill="transparent" />
                  <circle cx="24" cy="24" r="18" stroke="#10b981" strokeWidth="3.5" fill="transparent" strokeDasharray="113" strokeDashoffset={113 - (113 * activeQuery.accuracy) / 100} strokeLinecap="round" />
                </svg>
                <Target className="w-4 h-4 text-accent-emerald absolute" />
              </div>
            </div>

            {/* Sources Citations list (Interactive list) */}
            <div className="glass-panel p-5 rounded-xl border-white/5 space-y-4">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center border-b border-white/5 pb-2.5">
                <BookOpen className="w-4 h-4 text-primary mr-2" />
                Citation Explorer ({activeQuery.sources.length})
              </div>
              <div className="space-y-2.5">
                {activeQuery.sources.map((src, idx) => {
                  const active = activeSourceIndex === idx;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveSourceIndex(idx)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        active 
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                          : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono text-muted mb-1">
                        <span>[{idx + 1}] {src.title.split('.').pop()?.toUpperCase()}</span>
                        <span className="text-accent-cyan font-bold">RRF Rank #{idx + 1}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{src.title}</h4>
                      <div className="text-[10px] text-accent-emerald font-semibold font-mono mt-1">
                        Score: {(src.score * 100).toFixed(1)}% match
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Retrieved Chunk Text Viewer (Interactive Node display - Enterprise Feature #1) */}
            {activeSource && (
              <div className="glass-panel p-5 rounded-xl border-white/5 space-y-3 animate-fade-in">
                <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center">
                  <Layers className="w-4 h-4 text-accent mr-2" />
                  Retrieved Chunk Viewer
                </div>
                <div className="p-3 bg-[#050507] border border-white/5 rounded-lg text-[10px] text-gray-400 font-mono leading-relaxed h-[130px] overflow-y-auto select-text scrollbar-thin">
                  <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-1 py-0.2 rounded mr-1">
                    {activeSource.chunkId}
                  </span>
                  "{activeSource.snippet}"
                </div>
              </div>
            )}

            {/* Agent Execution Trace (Gantt flow - Enterprise Feature #2) */}
            <div className="glass-panel p-5 rounded-xl border-white/5 space-y-4">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center border-b border-white/5 pb-2.5">
                <Cpu className="w-4 h-4 text-accent mr-2" />
                Agent Run Latency Trace
              </div>
              <div className="space-y-3 font-mono text-[9px]">
                {activeQuery.steps.map((step, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-semibold">{step.agent}</span>
                      <span className="text-white font-bold">{step.durationMs}ms</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      {/* Estimate visual width based on step latency ratio */}
                      <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min((step.durationMs / 500) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Initial Empty Right Panel: Help and metadata summary */
          <div className="glass-panel p-5 rounded-xl border-white/5 text-center py-12 space-y-4">
            <HelpCircle className="w-8 h-8 text-primary mx-auto animate-pulse-glow" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Retrieval Insights</h4>
            <p className="text-[10px] text-muted leading-relaxed">
              Run a search query to activate vector metadata, RRF score simulator weights, and token execution timeline logs.
            </p>
          </div>
        )}
      </aside>

    </div>
  );
}
