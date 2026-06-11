'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Search, ZoomIn, ZoomOut, Filter, Info, Sparkles, 
  BookOpen, Layers, Tag, HelpCircle, RefreshCw, Maximize2, GitMerge,
  ChevronRight, ArrowRight, Eye, ShieldAlert, Award, EyeOff
} from 'lucide-react';
import { getStoredDocs, getStoredKBs, KnowledgeBase, Document } from '@/lib/db-mock';

// Define Graph Node structure
interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'chunk' | 'concept';
  val: number; // size relative weight
  color: string;
  x: number;
  y: number;
  details: {
    description: string;
    metrics?: Record<string, string | number>;
    tags?: string[];
  };
}

// Define Graph Link structure
interface GraphLink {
  source: string;
  target: string;
  label: string;
  type: 'contains' | 'references' | 'related_to';
}

export default function GraphExplorerPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-concept-transformer');
  
  // Filters
  const [showDocs, setShowDocs] = useState(true);
  const [showChunks, setShowChunks] = useState(true);
  const [showConcepts, setShowConcepts] = useState(true);
  
  // Canvas Transform (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Drag state for nodes
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  
  // Initial Nodes list with coordinates
  const [nodes, setNodes] = useState<GraphNode[]>([
    // Documents (Squares)
    { 
      id: 'node-doc-transformer', 
      label: 'attention_is_all_you_need.pdf', 
      type: 'document', 
      val: 24, 
      color: '#6366f1', 
      x: 180, 
      y: 120,
      details: {
        description: 'Original research paper proposing the Transformer sequence transduction model replacing recurrent loops with self-attention.',
        metrics: { 'File Size': '1.2 MB', 'Chunk Count': 14, 'Format': 'PDF', 'Vectorized Status': '100%' },
        tags: ['Transformer', 'Research Paper', 'LLM Base']
      }
    },
    { 
      id: 'node-doc-oncology', 
      label: 'oncology_treatment_protocols_2026.docx', 
      type: 'document', 
      val: 24, 
      color: '#a855f7', 
      x: 180, 
      y: 380,
      details: {
        description: 'Oncology dosage parameters utilizing Mosteller BSA computations and baseline check requirements.',
        metrics: { 'File Size': '850 KB', 'Chunk Count': 18, 'Format': 'DOCX', 'Vectorized Status': '100%' },
        tags: ['Oncology', 'Medical Docs', 'BSA Calculations']
      }
    },
    { 
      id: 'node-doc-handbook', 
      label: 'employee_handbook_2026.md', 
      type: 'document', 
      val: 24, 
      color: '#06b6d4', 
      x: 520, 
      y: 380,
      details: {
        description: 'NexusRAG core company tenets, remote sync schedules, and operational compliance parameters.',
        metrics: { 'File Size': '42 KB', 'Chunk Count': 6, 'Format': 'Markdown', 'Vectorized Status': '100%' },
        tags: ['HR Policies', 'Handbook', 'Company Tenets']
      }
    },

    // Chunks (Circles)
    { 
      id: 'node-chunk-transformer-1', 
      label: 'doc-transformer#chunk-1', 
      type: 'chunk', 
      val: 14, 
      color: '#4f46e5', 
      x: 320, 
      y: 90,
      details: {
        description: 'First chunk of Attention paper discussing the self-attention formula and multi-head mapping structures.',
        metrics: { 'Cosine similarity': 0.942, 'Token count': 350, 'Index ID': 'qdrant-uuid-391a' }
      }
    },
    { 
      id: 'node-chunk-transformer-2', 
      label: 'doc-transformer#chunk-4', 
      type: 'chunk', 
      val: 14, 
      color: '#4f46e5', 
      x: 320, 
      y: 190,
      details: {
        description: 'Position-wise feed-forward networks and positional sinusoidal signals integration.',
        metrics: { 'Cosine similarity': 0.812, 'Token count': 380, 'Index ID': 'qdrant-uuid-984b' }
      }
    },
    { 
      id: 'node-chunk-oncology-12', 
      label: 'doc-oncology#chunk-12', 
      type: 'chunk', 
      val: 14, 
      color: '#9333ea', 
      x: 320, 
      y: 330,
      details: {
        description: 'Formula rules for Body Surface Area (BSA) math using height/weight coordinates.',
        metrics: { 'Cosine similarity': 0.985, 'Token count': 410, 'Index ID': 'qdrant-uuid-112f' }
      }
    },
    { 
      id: 'node-chunk-oncology-15', 
      label: 'doc-oncology#chunk-15', 
      type: 'chunk', 
      val: 14, 
      color: '#9333ea', 
      x: 320, 
      y: 450,
      details: {
        description: 'Oncology protocols with ANC count limits and Pembrolizumab fixed intravenous metrics.',
        metrics: { 'Cosine similarity': 0.892, 'Token count': 390, 'Index ID': 'qdrant-uuid-552d' }
      }
    },
    { 
      id: 'node-chunk-handbook-2', 
      label: 'doc-handbook#chunk-2', 
      type: 'chunk', 
      val: 14, 
      color: '#0891b2', 
      x: 520, 
      y: 250,
      details: {
        description: 'Core synchronous EST window details and async remote team huddles rules.',
        metrics: { 'Cosine similarity': 0.978, 'Token count': 280, 'Index ID': 'qdrant-uuid-004a' }
      }
    },

    // Concepts / Topics (Diamonds)
    { 
      id: 'node-concept-transformer', 
      label: 'Transformer', 
      type: 'concept', 
      val: 20, 
      color: '#f59e0b', 
      x: 450, 
      y: 120,
      details: {
        description: 'A deep learning architecture based solely on self-attention mechanisms, dispensing with recurrence or convolutions.',
        metrics: { 'Degree Centrality': '4 links', 'PageRank Score': 0.082 }
      }
    },
    { 
      id: 'node-concept-attention', 
      label: 'Self-Attention', 
      type: 'concept', 
      val: 20, 
      color: '#f59e0b', 
      x: 580, 
      y: 90,
      details: {
        description: 'Mathematical mechanism mapping query-key value pairs to project long-range contextual bounds.',
        metrics: { 'Degree Centrality': '3 links', 'PageRank Score': 0.065 }
      }
    },
    { 
      id: 'node-concept-bsa', 
      label: 'BSA Calculation', 
      type: 'concept', 
      val: 20, 
      color: '#f59e0b', 
      x: 450, 
      y: 450,
      details: {
        description: 'Body Surface Area computed via the Mosteller method for pediatric and adult oncology drug delivery.',
        metrics: { 'Degree Centrality': '2 links', 'PageRank Score': 0.041 }
      }
    },
    { 
      id: 'node-concept-sync', 
      label: 'Core Hours', 
      type: 'concept', 
      val: 20, 
      color: '#f59e0b', 
      x: 680, 
      y: 280,
      details: {
        description: 'The mandatory 10 AM to 3 PM EST synchronous overlap schedule for company alignment.',
        metrics: { 'Degree Centrality': '2 links', 'PageRank Score': 0.038 }
      }
    }
  ]);

  const links: GraphLink[] = [
    // Contains relations
    { source: 'node-doc-transformer', target: 'node-chunk-transformer-1', label: 'contains', type: 'contains' },
    { source: 'node-doc-transformer', target: 'node-chunk-transformer-2', label: 'contains', type: 'contains' },
    { source: 'node-doc-oncology', target: 'node-chunk-oncology-12', label: 'contains', type: 'contains' },
    { source: 'node-doc-oncology', target: 'node-chunk-oncology-15', label: 'contains', type: 'contains' },
    { source: 'node-doc-handbook', target: 'node-chunk-handbook-2', label: 'contains', type: 'contains' },

    // References relations
    { source: 'node-chunk-transformer-1', target: 'node-concept-transformer', label: 'references', type: 'references' },
    { source: 'node-chunk-transformer-1', target: 'node-concept-attention', label: 'references', type: 'references' },
    { source: 'node-chunk-transformer-2', target: 'node-concept-transformer', label: 'references', type: 'references' },
    { source: 'node-chunk-oncology-12', target: 'node-concept-bsa', label: 'references', type: 'references' },
    { source: 'node-chunk-oncology-12', target: 'node-concept-transformer', label: 'references', type: 'references' }, // hybrid reference
    { source: 'node-chunk-handbook-2', target: 'node-concept-sync', label: 'references', type: 'references' },

    // Related to relations
    { source: 'node-concept-transformer', target: 'node-concept-attention', label: 'related_to', type: 'related_to' },
    { source: 'node-concept-sync', target: 'node-concept-attention', label: 'related_to', type: 'related_to' } // async huddle concept link
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Zoom buttons
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.4));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Check if clicking on background (not a node)
    const target = e.target as SVGElement;
    if (target.tagName === 'svg' || target.id === 'canvas-bg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      // Update coordinates of dragged node
      // Project mouse coordinates to SVG plane using pan & zoom
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left - pan.x;
      const clientY = e.clientY - rect.top - pan.y;
      
      const newX = clientX / zoom;
      const newY = clientY / zoom;

      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === draggedNodeId 
            ? { ...node, x: Math.max(20, Math.min(780, newX)), y: Math.max(20, Math.min(580, newY)) }
            : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  if (!mounted) return null;

  // Filter nodes based on checkboxes and search query
  const visibleNodes = nodes.filter(node => {
    if (node.type === 'document' && !showDocs) return false;
    if (node.type === 'chunk' && !showChunks) return false;
    if (node.type === 'concept' && !showConcepts) return false;
    if (searchQuery.trim()) {
      return node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
             node.details.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

  // Filter links where both source and target are visible
  const visibleLinks = links.filter(link => {
    return visibleNodeIds.has(link.source) && visibleNodeIds.has(link.target);
  });

  // Selected Node Details
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Helper to find links connected to the selected node
  const connectedLinks = selectedNodeId 
    ? links.filter(link => link.source === selectedNodeId || link.target === selectedNodeId)
    : [];

  return (
    <div className="space-y-6 animate-slide-up flex flex-col h-[calc(100vh-8.5rem)] text-left select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Network className="w-5 h-5 text-primary mr-2.5" />
            Knowledge Graph Explorer
          </h1>
          <p className="text-xs text-muted mt-0.5">Visualize semantic connections, extracted entities, and vector chunk linkages.</p>
        </div>
        
        {/* Graph Diagnostics */}
        <div className="flex items-center space-x-3 text-xs bg-[#0b0b14]/80 border border-[#27274a] px-3.5 py-1.5 rounded-lg shadow-lg">
          <span className="flex items-center text-primary"><GitMerge className="w-3.5 h-3.5 mr-1" /> Nodes: <strong className="text-white font-mono ml-1">{nodes.length}</strong></span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center text-accent"><Network className="w-3.5 h-3.5 mr-1" /> Edges: <strong className="text-white font-mono ml-1">{links.length}</strong></span>
          <span className="text-gray-600">|</span>
          <span className="text-accent-emerald font-semibold font-mono text-[10px]">DENSITY: 0.18</span>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 items-stretch">
        
        {/* LEFT COLUMN: FILTERS & TOPOLOGY */}
        <div className="xl:col-span-1 glass-panel p-5 rounded-xl border-white/5 flex flex-col justify-between space-y-6 overflow-y-auto">
          
          {/* SEARCH */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Entity Search</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts or docs..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg glass-input text-xs"
              />
            </div>
          </div>

          {/* LAYER FILTERS */}
          <div className="space-y-3.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Filter Graph Layers</label>
            
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#6366f1] border border-white/10 shrink-0"></span>
                  <span>Document Nodes</span>
                </div>
                <input
                  type="checkbox"
                  checked={showDocs}
                  onChange={(e) => setShowDocs(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] border border-white/10 shrink-0"></span>
                  <span>Chunk Nodes</span>
                </div>
                <input
                  type="checkbox"
                  checked={showChunks}
                  onChange={(e) => setShowChunks(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  {/* Diamond shape approximation */}
                  <span className="w-2.5 h-2.5 rotate-45 bg-[#f59e0b] border border-white/10 shrink-0"></span>
                  <span>Extracted Concepts</span>
                </div>
                <input
                  type="checkbox"
                  checked={showConcepts}
                  onChange={(e) => setShowConcepts(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* GRAPH TOPOLOGY ANALYTICS */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Topology Analytics</label>
            
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-center text-[10px] text-muted font-mono">
                  <span>CLUSTERING COEFFICIENT</span>
                  <span className="text-white font-bold">0.642</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '64.2%' }}></div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-center text-[10px] text-muted font-mono">
                  <span>PAGERANK VARIATION</span>
                  <span className="text-white font-bold">0.082 Max</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* HELP INFO */}
          <div className="p-3 bg-[#050507] border border-white/5 rounded-lg text-[10px] text-muted flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5 animate-pulse" />
            <p className="leading-relaxed">
              Drag nodes to configure layouts manually. Double click nodes to inspect their sub-chunks and semantic indices.
            </p>
          </div>
        </div>

        {/* CENTER VIEWPORT: THE CANVAS (Span 3) */}
        <div className="xl:col-span-3 glass-panel rounded-xl border-white/5 flex flex-col h-full overflow-hidden relative bg-[#040407]/30">
          <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>

          {/* CANVAS TOP CONTROL HEADER */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-[#09090c]/40 z-10">
            <div className="text-[10px] text-muted font-mono flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
              </span>
              GRAPH WORKSPACE ACTIVE
            </div>
            
            {/* Zoom / Pan Actions */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleZoomIn}
                className="p-1.5 rounded hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-muted"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-1.5 rounded hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-muted"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleZoomReset}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-white text-[9px] font-mono font-semibold px-2 cursor-pointer transition-all active:scale-95"
              >
                RESET VIEW
              </button>
            </div>
          </div>

          {/* SVG RENDERING FIELD */}
          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <svg 
              className="w-full h-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              viewBox="0 0 800 600"
            >
              {/* Grid Background click target */}
              <rect id="canvas-bg" width="800" height="600" fill="transparent" />

              {/* Group containing transform translations for Zoom & Pan */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                
                {/* 1. DRAW LINKS FIRST (so they fall underneath nodes) */}
                {visibleLinks.map((link, idx) => {
                  const srcNode = nodes.find(n => n.id === link.source);
                  const tgtNode = nodes.find(n => n.id === link.target);
                  
                  if (!srcNode || !tgtNode) return null;
                  
                  // Compute link colors
                  let lineColor = 'rgba(255,255,255,0.08)';
                  let lineDash = '0';
                  if (link.type === 'contains') {
                    lineColor = 'rgba(99, 102, 241, 0.4)';
                  } else if (link.type === 'references') {
                    lineColor = 'rgba(168, 85, 247, 0.4)';
                    lineDash = '4 3';
                  } else if (link.type === 'related_to') {
                    lineColor = 'rgba(245, 158, 11, 0.3)';
                    lineDash = '2 2';
                  }

                  const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;
                  if (isHighlighted) {
                    lineColor = link.type === 'contains' ? '#6366f1' : link.type === 'references' ? '#a855f7' : '#f59e0b';
                  }

                  return (
                    <g key={idx}>
                      <line
                        x1={srcNode.x}
                        y1={srcNode.y}
                        x2={tgtNode.x}
                        y2={tgtNode.y}
                        stroke={lineColor}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeDasharray={lineDash}
                        style={{ transition: 'stroke 0.2s ease' }}
                      />
                    </g>
                  );
                })}

                {/* 2. DRAW NODES */}
                {visibleNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  
                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggedNodeId(node.id);
                        setSelectedNodeId(node.id);
                      }}
                    >
                      {/* Selection Aura Glow */}
                      {isSelected && (
                        <circle 
                          cx="0" 
                          cy="0" 
                          r={node.val + 8} 
                          fill="none" 
                          stroke={node.color} 
                          strokeWidth="2.5" 
                          strokeDasharray="4 2"
                          className="animate-spin"
                          style={{ animationDuration: '8s' }}
                        />
                      )}

                      {/* Node Shapes depending on type */}
                      {node.type === 'document' && (
                        <rect
                          x={-node.val / 2}
                          y={-node.val / 2}
                          width={node.val}
                          height={node.val}
                          rx="4"
                          fill="#09090c"
                          stroke={node.color}
                          strokeWidth={isSelected ? 3.5 : 2}
                          className="transition-all hover:scale-110"
                        />
                      )}

                      {node.type === 'chunk' && (
                        <circle
                          cx="0"
                          cy="0"
                          r={node.val / 2}
                          fill="#09090c"
                          stroke={node.color}
                          strokeWidth={isSelected ? 3.5 : 2}
                          className="transition-all hover:scale-110"
                        />
                      )}

                      {node.type === 'concept' && (
                        <polygon
                          points={`0,${-node.val/1.3} ${node.val/1.3},0 0,${node.val/1.3} ${-node.val/1.3},0`}
                          fill="#09090c"
                          stroke={node.color}
                          strokeWidth={isSelected ? 3.5 : 2}
                          className="transition-all hover:scale-110"
                        />
                      )}

                      {/* Icon inside Node if needed */}
                      {node.type === 'document' && (
                        <BookOpen className="w-3.5 h-3.5 text-white/70 absolute -translate-x-1.5 -translate-y-1.5 pointer-events-none" />
                      )}
                      
                      {/* Label Text */}
                      <text
                        x="0"
                        y={node.val + 2}
                        fill={isSelected ? '#fff' : '#8b8b93'}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor="middle"
                        className="pointer-events-none select-none font-bold"
                      >
                        {node.label.length > 18 ? node.label.substring(0, 15) + '...' : node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* GRAPH LEGEND */}
          <div className="absolute bottom-4 left-4 glass-panel border border-white/5 p-3 rounded-lg flex space-x-4 text-[9.5px] text-muted z-10 shadow-lg pointer-events-none select-none">
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded bg-[#6366f1] mr-1.5 border border-white/5"></span>Document</div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] mr-1.5 border border-white/5"></span>Chunk</div>
            <div className="flex items-center"><span className="w-2.5 h-2.5 rotate-45 bg-[#f59e0b] mr-1.5 border border-white/5"></span>Concept Entity</div>
          </div>
        </div>

      </div>

      {/* RIGHT DRAWER: NODE INSPECTOR (Linear / Notion Slide-over style) */}
      <div 
        className={`drawer-overlay ${selectedNodeId ? 'open' : ''}`}
        onClick={() => setSelectedNodeId(null)}
      />
      <div className={`drawer-slide-over p-5 flex flex-col justify-between overflow-y-auto ${selectedNodeId ? 'open' : ''}`}>
        {selectedNode ? (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            
            {/* Node Header Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2">
                  {selectedNode.type === 'document' && <BookOpen className="w-4 h-4 text-[#6366f1]" />}
                  {selectedNode.type === 'chunk' && <Layers className="w-4 h-4 text-[#a855f7]" />}
                  {selectedNode.type === 'concept' && <Tag className="w-4 h-4 text-[#f59e0b]" />}
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Node Details</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] capitalize font-bold ${
                    selectedNode.type === 'document' ? 'text-primary bg-primary/10' :
                    selectedNode.type === 'chunk' ? 'text-accent bg-accent/10' : 'text-accent-amber bg-accent-amber/10'
                  }`}>
                    {selectedNode.type}
                  </span>
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="text-muted hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Node Name</div>
                <h4 className="text-xs font-bold text-white break-all font-mono">{selectedNode.label}</h4>
              </div>

              <div className="space-y-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Extracted Claims & Scope</div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{selectedNode.details.description}</p>
              </div>
            </div>

            {/* Node Attributes & Metrics */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">Key Attributes</div>
              
              <div className="space-y-2 text-xs font-mono">
                {selectedNode.details.metrics && Object.entries(selectedNode.details.metrics).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-2 rounded bg-[#050507] border border-white/5">
                    <span className="text-gray-500 font-semibold">{key}</span>
                    <span className="text-white font-bold">{val}</span>
                  </div>
                ))}
                {selectedNode.details.tags && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.details.tags.map((tag) => (
                        <span key={tag} className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Relationships connections list */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center">
                <Network className="w-3.5 h-3.5 text-primary mr-1.5" />
                Adjacent Relations ({connectedLinks.length})
              </div>
              
              <div className="space-y-2 h-[120px] overflow-y-auto pr-1 scrollbar-thin">
                {connectedLinks.map((link, idx) => {
                  const otherNodeId = link.source === selectedNode.id ? link.target : link.source;
                  const otherNode = nodes.find(n => n.id === otherNodeId);
                  
                  if (!otherNode) return null;

                  return (
                    <div 
                      key={idx}
                      onClick={() => setSelectedNodeId(otherNode.id)}
                      className="p-2 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors rounded-lg flex items-center justify-between text-[10.5px] cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: otherNode.color }}></span>
                        <span className="text-white font-semibold truncate font-mono">{otherNode.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted uppercase font-bold shrink-0">
                        {link.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <HelpCircle className="w-8 h-8 text-muted animate-pulse" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Node Inspector</h4>
            <p className="text-[10px] text-muted leading-relaxed">
              Click any node in the interactive graph workspace to inspect its vector metrics, parent file attachments, PageRank scores, and semantic extraction weights.
            </p>
          </div>
        )}
        
        <div className="text-[9px] text-muted border-t border-white/5 pt-4 flex items-center justify-between font-mono mt-4 shrink-0">
          <span>Graph Registry: SQL/Qdrant</span>
          <span>Index Auto-sync</span>
        </div>
      </div>
    </div>
  );
}
