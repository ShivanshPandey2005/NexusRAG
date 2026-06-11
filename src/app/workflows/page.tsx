'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, Sparkles, Terminal, Settings, CheckCircle2, 
  HelpCircle, Play, Pause, ChevronRight, Info, BookOpen, Clock
} from 'lucide-react';

interface AgentNode {
  id: string;
  name: string;
  role: string;
  model: string;
  temperature: number;
  prompt: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  durationMs: number;
  logs: string[];
}

export default function AgentWorkflowsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('agent-planner');
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
  
  // Terminal log stream state
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['NexusRAG Agent Supervisor initialized. Select "Run Pipeline" to execute graph.']);

  const [agents, setAgents] = useState<AgentNode[]>([
    {
      id: 'agent-planner',
      name: 'Query Planner',
      role: 'Query Expansion & Intention Deconstruction',
      model: 'gpt-4o-mini',
      temperature: 0.2,
      prompt: 'Deconstruct the query, mask any PII, and generate 3 hypothetical document answer variations (HyDE).',
      status: 'idle',
      durationMs: 240,
      logs: [
        'planner: Received query "What is attention mechanism?"',
        'planner: PII Compliance check passed.',
        'planner: Generated hypothetical answer variations.'
      ]
    },
    {
      id: 'agent-retriever',
      name: 'Retrieval Agent',
      role: 'Dual-Path Collection Fetch',
      model: 'text-embedding-3-large',
      temperature: 0.0,
      prompt: 'Query Qdrant collections using dense vector parameters and sparse BM25 indices simultaneously.',
      status: 'idle',
      durationMs: 420,
      logs: [
        'retriever: Querying Qdrant index "nexusrag"...',
        'retriever: Dense results: 4 candidates found.',
        'retriever: Sparse BM25 results: 3 candidates found.'
      ]
    },
    {
      id: 'agent-reranker',
      name: 'Reranking Agent',
      role: 'Cross-Encoder Context Reranker',
      model: 'cohere-rerank-v3',
      temperature: 0.1,
      prompt: 'Calculate mutual attention matrices between candidate chunks and the expanded user queries.',
      status: 'idle',
      durationMs: 310,
      logs: [
        'reranker: Loading Cohere rerank english-v3.0 model.',
        'reranker: Reciprocal Rank Fusion completed.',
        'reranker: Discarded 4 chunks below relevance score 0.45.'
      ]
    },
    {
      id: 'agent-reasoner',
      name: 'Reasoning Agent',
      role: 'Context Compression & Synthesis',
      model: 'claude-3-5-sonnet',
      temperature: 0.4,
      prompt: 'Prune redundant prompt tokens using LLMLingua. Synthesize final answer based strictly on remaining chunks.',
      status: 'idle',
      durationMs: 780,
      logs: [
        'reasoner: Prompt compressed (saved 18% tokens).',
        'reasoner: Synthesizing markdown answer based on top 3 contexts.'
      ]
    },
    {
      id: 'agent-citation',
      name: 'Citation Agent',
      role: 'Source Mapping & Grounding',
      model: 'gpt-4o-mini',
      temperature: 0.1,
      prompt: 'Resolve citations, generating hover cards linking snippets to original document IDs.',
      status: 'idle',
      durationMs: 190,
      logs: [
        'citation: Processing final answer references.',
        'citation: Mapped [1] to doc-transformer and [2] to doc-reasoning.'
      ]
    },
    {
      id: 'agent-validator',
      name: 'Validation Agent',
      role: 'Fact-checking & Hallucination Shield',
      model: 'gpt-4-turbo',
      temperature: 0.0,
      prompt: 'Verify that all facts stated in the response are grounded in original document chunk contents.',
      status: 'idle',
      durationMs: 340,
      logs: [
        'validator: running groundedness checks...',
        'validator: 100% facts verified. Hallucinations index: 0.0'
      ]
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const selectedAgent = agents.find(a => a.id === selectedAgentId)!;

  // Run graph flow simulation
  const handleRunPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLogs(['Starting Supervisor pipeline...', 'Initializing state graph...']);
    
    // Set all agents to idle first
    setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
    
    let currentIdx = 0;
    
    const executeStep = () => {
      if (currentIdx >= agents.length) {
        setIsRunning(false);
        setActiveNodeIndex(null);
        setTerminalLogs(prev => [...prev, 'Graph execution finished. All validation filters passed.', 'RAG output saved in memory.']);
        return;
      }
      
      setActiveNodeIndex(currentIdx);
      const activeAgent = agents[currentIdx];
      
      // Update agent status to running
      setAgents(prev => prev.map((a, i) => i === currentIdx ? { ...a, status: 'running' } : a));
      
      // Append logs to terminal
      setTerminalLogs(prev => [
        ...prev, 
        `>>> Waking up [${activeAgent.name}]...`,
        ...activeAgent.logs,
        `Completed in ${activeAgent.durationMs}ms.`
      ]);

      // Complete step
      setTimeout(() => {
        setAgents(prev => prev.map((a, i) => i === currentIdx ? { ...a, status: 'completed' } : a));
        currentIdx += 1;
        executeStep();
      }, 1200);
    };

    executeStep();
  };

  const handleUpdateAgentSettings = (updatedPrompt: string, updatedTemp: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id === selectedAgentId) {
        return { ...a, prompt: updatedPrompt, temperature: updatedTemp };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-8 animate-slide-up flex flex-col h-full">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Agent Workflows</h1>
          <p className="text-sm text-muted mt-1">Configure individual prompt directives, assign LLMs, and inspect multi-agent supervisor loops.</p>
        </div>
        <button
          onClick={handleRunPipeline}
          disabled={isRunning}
          className="bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none text-white py-2 px-4 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Run Pipeline</span>
        </button>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* LEFT & CENTER: VISUAL NODE DIAGRAM GRAPH (Enterprise Feature #2) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border-white/5 flex flex-col h-[580px] justify-between relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <GitBranch className="w-4 h-4 text-primary mr-2" />
              Supervisor Multi-Agent Diagram
            </h3>
            <span className="text-[10px] text-muted font-mono flex items-center">
              <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full mr-2 animate-pulse"></span>
              State: {isRunning ? 'Running Graph' : 'Idle'}
            </span>
          </div>

          {/* SVG FLOW GRAPH CANVAS */}
          <div className="flex-1 flex items-center justify-center relative z-10 py-6 min-h-[350px]">
            <svg className="w-full h-full max-w-[650px] max-h-[380px]" viewBox="0 0 650 320">
              {/* Connection Lines (Arrows) */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#27272a" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
              </defs>

              {/* Rows layout: Grid of nodes */}
              {/* Row 1: Planner -> Retriever -> Reranker */}
              <line x1="100" y1="80" x2="300" y2="80" stroke={activeNodeIndex === 1 ? '#6366f1' : '#27272a'} strokeWidth="2" markerEnd={activeNodeIndex === 1 ? "url(#arrow-active)" : "url(#arrow)"} className="transition-all" />
              <line x1="300" y1="80" x2="500" y2="80" stroke={activeNodeIndex === 2 ? '#6366f1' : '#27272a'} strokeWidth="2" markerEnd={activeNodeIndex === 2 ? "url(#arrow-active)" : "url(#arrow)"} />
              
              {/* Vertical link down */}
              <line x1="500" y1="80" x2="500" y2="220" stroke={activeNodeIndex === 3 ? '#6366f1' : '#27272a'} strokeWidth="2" markerEnd={activeNodeIndex === 3 ? "url(#arrow-active)" : "url(#arrow)"} />
              
              {/* Row 2: Validator <- Citation <- Reasoner */}
              <line x1="500" y1="220" x2="300" y2="220" stroke={activeNodeIndex === 4 ? '#6366f1' : '#27272a'} strokeWidth="2" markerEnd={activeNodeIndex === 4 ? "url(#arrow-active)" : "url(#arrow)"} />
              <line x1="300" y1="220" x2="100" y2="220" stroke={activeNodeIndex === 5 ? '#6366f1' : '#27272a'} strokeWidth="2" markerEnd={activeNodeIndex === 5 ? "url(#arrow-active)" : "url(#arrow)"} />
              
              {/* Loop back to start line */}
              <line x1="100" y1="220" x2="100" y2="80" stroke="#27272a" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />

              {/* DRAW AGENT NODES */}
              {[
                { id: 'agent-planner', name: '1. Query Planner', x: 100, y: 80, color: 'from-primary/20 to-primary/5', border: 'border-primary' },
                { id: 'agent-retriever', name: '2. Retriever', x: 300, y: 80, color: 'from-accent/20 to-accent/5', border: 'border-accent' },
                { id: 'agent-reranker', name: '3. Reranker', x: 500, y: 80, color: 'from-accent-cyan/20 to-accent-cyan/5', border: 'border-accent-cyan' },
                { id: 'agent-reasoner', name: '4. Reasoner', x: 500, y: 220, color: 'from-accent-rose/20 to-accent-rose/5', border: 'border-accent-rose' },
                { id: 'agent-citation', name: '5. Citation', x: 300, y: 220, color: 'from-accent-amber/20 to-accent-amber/5', border: 'border-accent-amber' },
                { id: 'agent-validator', name: '6. Validator', x: 100, y: 220, color: 'from-accent-emerald/20 to-accent-emerald/5', border: 'border-accent-emerald' }
              ].map((node, i) => {
                const isSelected = selectedAgentId === node.id;
                const agentData = agents.find(a => a.id === node.id)!;
                const isNodeActive = activeNodeIndex === i;
                
                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x - 70}, ${node.y - 30})`}
                    onClick={() => setSelectedAgentId(node.id)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Glowing highlight border if active */}
                    <rect 
                      x="-4" y="-4" width="148" height="68" rx="10"
                      fill="none" 
                      stroke={isNodeActive ? '#6366f1' : isSelected ? '#a855f7' : 'transparent'}
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    {/* Main rect */}
                    <rect 
                      x="0" y="0" width="140" height="60" rx="8" 
                      fill="#09090b" 
                      stroke={isNodeActive ? '#6366f1' : isSelected ? '#a855f7' : '#1f1f23'}
                      strokeWidth="1.5"
                      className="transition-colors group-hover:stroke-white/30"
                    />
                    
                    {/* Agent state dot */}
                    <circle 
                      cx="15" cy="18" r="4" 
                      fill={
                        agentData.status === 'running' 
                          ? '#a855f7' 
                          : agentData.status === 'completed' 
                          ? '#10b981' 
                          : '#52525b'
                      }
                      className={agentData.status === 'running' ? 'animate-ping' : ''}
                    />
                    
                    <text x="26" y="22" fill="#fafafa" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                      {node.name}
                    </text>
                    <text x="15" y="42" fill="#71717a" fontSize="8" fontFamily="sans-serif">
                      Model: {agentData.model}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* TERMINAL FEED PANEL */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider mb-2">
              <Terminal className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Supervisor Event Logs</span>
            </div>
            <div className="terminal-view p-3 h-[130px] overflow-y-auto text-left select-text scrollbar-thin text-[10px] space-y-1">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex space-x-2">
                  <span className="text-gray-600 shrink-0 font-bold">~</span>
                  <span className={log.startsWith('>>>') ? 'text-accent' : log.startsWith('Completed') ? 'text-accent-emerald' : 'text-gray-300'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED AGENT DIRECTIVE EDITOR (Enterprise Feature #2) */}
        <div className="glass-panel p-6 rounded-xl border-white/5 space-y-6 lg:col-span-1 h-[580px] overflow-y-auto flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
              <Settings className="w-4.5 h-4.5 text-accent" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedAgent.name}</h3>
                <p className="text-[10px] text-muted">Agent System Parameter Control</p>
              </div>
            </div>

            {/* Role details */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Description</div>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">{selectedAgent.role}</p>
            </div>

            {/* Model routing selection */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Model Routing</label>
                <select
                  value={selectedAgent.model}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAgents(prev => prev.map(a => a.id === selectedAgentId ? { ...a, model: val } : a));
                  }}
                  className="w-full py-1.5 px-2 rounded-lg glass-input text-[11px]"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  <option value="claude-3-5-sonnet">claude-3.5-sonnet</option>
                  <option value="cohere-rerank-v3">cohere-rerank-v3</option>
                  <option value="text-embedding-3-large">embed-3-large</option>
                </select>
              </div>
              
              <div>
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Temperature</label>
                <input
                  type="number"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={selectedAgent.temperature}
                  onChange={(e) => handleUpdateAgentSettings(selectedAgent.prompt, Number(e.target.value))}
                  className="w-full py-1.5 px-2 rounded-lg glass-input text-[11px] font-mono"
                />
              </div>
            </div>

            {/* System Prompt instruction */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">System Instructions</label>
              <textarea
                value={selectedAgent.prompt}
                onChange={(e) => handleUpdateAgentSettings(e.target.value, selectedAgent.temperature)}
                className="w-full py-2.5 px-3 rounded-lg glass-input text-[11px] h-32 resize-none leading-relaxed font-mono"
              />
            </div>
          </div>

          {/* Prompt warning footer */}
          <div className="p-3 rounded-lg border border-white/5 bg-white/[0.01] text-[10px] text-muted flex items-start space-x-2 mt-4">
            <Info className="w-4 h-4 shrink-0 text-primary mt-0.5" />
            <p className="leading-relaxed">
              Updates to system instructions configure the agent behavior globally in the LangGraph coordinator state loops. Ensure outputs format JSON/Text variables correctly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
