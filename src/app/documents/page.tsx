'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, UploadCloud, Search, Trash2, CheckCircle2, 
  Loader2, Filter, AlertCircle, Eye, EyeOff, LayoutPanelLeft, Sparkles, BookOpen
} from 'lucide-react';
import { getStoredDocs, saveDocs, getStoredKBs, saveKBs, Document, KnowledgeBase } from '@/lib/db-mock';

export default function DocumentsPage() {
  const [mounted, setMounted] = useState(false);
  const [docs, setDocs] = useState<Document[]>([]);
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedKb, setSelectedKb] = useState('all');
  
  // Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  
  // Detail Panel
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    setMounted(true);
    setDocs(getStoredDocs());
    setKbs(getStoredKBs());
  }, []);

  if (!mounted) return null;

  // Filter documents
  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesKb = selectedKb === 'all' || doc.kbId === selectedKb;
    return matchesSearch && matchesKb;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the row
    if (confirm('Are you sure you want to delete this document? Vector index records will be deleted.')) {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      saveDocs(updated);
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
    }
  };

  // Simulate file upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    if (kbs.length === 0) {
      alert('Please create at least one Knowledge Base collection first.');
      return;
    }
    
    // Default destination collection: the first one
    const targetKb = kbs[0];

    files.forEach(file => {
      const name = file.name;
      const size = file.size;
      const ext = name.split('.').pop()?.toLowerCase();
      
      if (!['pdf', 'docx', 'txt', 'md'].includes(ext || '')) {
        alert(`Unsupported file extension: .${ext}. Supported: PDF, DOCX, TXT, MD`);
        return;
      }

      setUploadingFiles(prev => [...prev, name]);

      // Create simulated new document
      setTimeout(() => {
        const docId = `doc-${Math.random().toString(36).substring(2, 6)}`;
        const chunksCount = Math.max(Math.floor(size / 350), 2);
        
        const newDoc: Document = {
          id: docId,
          name: name,
          type: ext as any,
          kbId: targetKb.id,
          kbName: targetKb.name,
          sizeBytes: size,
          chunkCount: 0, // Starts at 0, goes up when vectorized
          uploadDate: new Date().toISOString(),
          status: 'ingesting',
          tags: [ext?.toUpperCase() || 'FILE', 'User Upload'],
          author: 'Self (Uploaded)',
          metadata: {
            title: name.replace(/\.[^/.]+$/, "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            description: `User uploaded file. Format: ${ext?.toUpperCase()}. size: ${(size / 1000).toFixed(1)} KB`
          },
          content: `This is a preview representation of the parsed content of the document: ${name}. Standard semantic chunking splits sentences based on punctuation and context. It is indexed inside collection: ${targetKb.name}.`
        };

        // Add to state
        setDocs(prev => {
          const updated = [newDoc, ...prev];
          saveDocs(updated);
          return updated;
        });

        // Remove from upload list
        setUploadingFiles(prev => prev.filter(f => f !== name));

        // Simulate processing flow: ingesting -> parsing -> chunked -> vectorized
        triggerIngestionSimulation(docId, chunksCount);
      }, 1500);
    });
  };

  const triggerIngestionSimulation = (docId: string, finalChunks: number) => {
    // 1. Ingesting to Parsing
    setTimeout(() => {
      updateDocStatus(docId, 'parsing', 0);
      
      // 2. Parsing to Chunked
      setTimeout(() => {
        updateDocStatus(docId, 'chunked', finalChunks);
        
        // 3. Chunked to Vectorized
        setTimeout(() => {
          updateDocStatus(docId, 'vectorized', finalChunks);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const updateDocStatus = (id: string, status: Document['status'], chunks: number) => {
    setDocs(prev => {
      const updated = prev.map(d => {
        if (d.id === id) {
          const updatedDoc = { ...d, status, chunkCount: chunks };
          // If selected, update preview details too
          if (selectedDoc?.id === id) {
            setSelectedDoc(updatedDoc);
          }
          return updatedDoc;
        }
        return d;
      });
      saveDocs(updated);
      
      // Dynamically update corresponding KB collection metrics as well!
      if (status === 'vectorized') {
        const doc = prev.find(d => d.id === id);
        if (doc) {
          const kbsList = getStoredKBs();
          const updatedKbs = kbsList.map(kb => {
            if (kb.id === doc.kbId) {
              return {
                ...kb,
                documentsCount: kb.documentsCount + 1,
                chunkCount: kb.chunkCount + chunks,
                sizeBytes: kb.sizeBytes + doc.sizeBytes
              };
            }
            return kb;
          });
          saveKBs(updatedKbs);
        }
      }
      return updated;
    });
  };

  return (
    <div className="space-y-8 animate-slide-up flex flex-col h-full">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Document Center</h1>
        <p className="text-sm text-muted mt-1">Ingest raw files into collections, monitor text parsing, and inspect chunk metadata.</p>
      </div>

      {/* Main Grid: Split panel if doc selected */}
      {/* Main Grid: Full width panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        {/* LEFT COLUMN: LIST & UPLOAD */}
        <div className="space-y-6 lg:col-span-3">
          
          {/* UPLOAD DROPZONE */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
              isDragging 
                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
            }`}
          >
            <input 
              type="file" 
              multiple 
              onChange={handleFileSelect} 
              accept=".pdf,.docx,.txt,.md"
              className="hidden" 
              id="file-upload" 
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">Drag & drop files here, or <span className="text-primary hover:text-accent transition-colors">browse files</span></p>
              <p className="text-xs text-muted mt-1">Supports PDF, DOCX, TXT, MD up to 25MB. Files are chunked and vectorized locally.</p>
            </label>
          </div>

          {/* UPLOADING PROGRESS LIST */}
          {uploadingFiles.length > 0 && (
            <div className="glass-panel p-4 rounded-xl space-y-3 border-white/5 animate-fade-in">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary mr-2" />
                Ingesting Files...
              </h4>
              <div className="space-y-2 text-xs">
                {uploadingFiles.map(file => (
                  <div key={file} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
                    <span className="text-gray-300 truncate max-w-[200px]">{file}</span>
                    <span className="text-primary font-mono text-[10px] animate-pulse">Running OCR & parsing...</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILTER & SEARCH */}
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents by filename or tag..."
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
              />
            </div>
            
            {/* Collection Filter */}
            <div className="relative w-full md:w-[220px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
                <Filter className="w-4 h-4" />
              </span>
              <select
                value={selectedKb}
                onChange={(e) => setSelectedKb(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-xs"
              >
                <option value="all">All Collections</option>
                {kbs.map(kb => (
                  <option key={kb.id} value={kb.id}>{kb.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE OF INGESTED DOCUMENTS */}
          <div className="glass-panel rounded-xl border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Filename</th>
                    <th className="py-3 px-4 font-semibold">Collection</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-center">Chunks</th>
                    <th className="py-3 px-4 font-semibold text-right">Upload Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => {
                      const isSelected = selectedDoc?.id === doc.id;
                      return (
                        <tr 
                          key={doc.id} 
                          onClick={() => setSelectedDoc(doc)}
                          className={`border-b border-white/5 text-gray-300 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                            isSelected ? 'bg-white/5' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2.5">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate max-w-[160px]">{doc.name}</span>
                          </td>
                          <td className="py-3.5 px-4 text-muted">{doc.kbName}</td>
                          <td className="py-3.5 px-4 text-muted">{(doc.sizeBytes / 1024).toFixed(1)} KB</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono capitalize font-bold ${
                              doc.status === 'vectorized' 
                                ? 'text-accent-emerald bg-accent-emerald/10' 
                                : doc.status === 'parsing' 
                                ? 'text-accent bg-accent/10 animate-pulse'
                                : doc.status === 'ingesting'
                                ? 'text-primary bg-primary/10 animate-pulse'
                                : 'text-muted-dark bg-muted/10'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-white font-semibold">{doc.chunkCount}</td>
                          <td className="py-3.5 px-4 text-right text-muted">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={(e) => handleDelete(doc.id, e)}
                                className="p-1 rounded text-muted hover:bg-accent-rose/10 hover:text-accent-rose transition-colors cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted text-sm">
                        No documents matched your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT DRAWER: DOCUMENT DETAIL VIEWER (Linear / Notion Slide-over style) */}
        <div 
          className={`drawer-overlay ${selectedDoc ? 'open' : ''}`}
          onClick={() => setSelectedDoc(null)}
        />
        <div className={`drawer-slide-over p-6 flex flex-col justify-between overflow-y-auto ${selectedDoc ? 'open' : ''}`}>
          {selectedDoc && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Metadata Inspector</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedDoc(null)}
                    className="text-muted hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                </div>

                {/* Title Info */}
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                  <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Document Title</div>
                  <h4 className="text-xs font-bold text-white">{selectedDoc.metadata.title}</h4>
                  <div className="text-[10px] text-muted mt-2">Author: <span className="text-white font-medium">{selectedDoc.author}</span></div>
                </div>

                {/* Status details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-white/5 bg-[#050507]">
                    <div className="text-gray-500 font-semibold uppercase text-[9px] tracking-wider">Collection</div>
                    <div className="text-white font-bold mt-1 truncate">{selectedDoc.kbName}</div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-white/5 bg-[#050507]">
                    <div className="text-gray-500 font-semibold uppercase text-[9px] tracking-wider">Chunk Count</div>
                    <div className="text-white font-bold mt-1">{selectedDoc.chunkCount} sub-chunks</div>
                  </div>
                </div>

                {/* Chunk text preview */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Semantic Chunk Preview</div>
                  <div className="p-3.5 bg-[#050507] border border-white/5 rounded-lg text-[10px] text-gray-400 font-mono leading-relaxed h-[180px] overflow-y-auto select-text scrollbar-thin">
                    <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-1 py-0.2 rounded mr-1.5">Chunk #0</span>
                    {selectedDoc.content || "No preview content available."}
                  </div>
                </div>

                {/* Qdrant Vector Metadata Payload JSON */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
                    <Sparkles className="w-3 h-3 text-accent mr-1.5 animate-pulse" />
                    Qdrant Vector Payload JSON
                  </div>
                  <pre className="p-3 bg-white/[0.01] border border-white/5 rounded-lg text-[9px] text-accent-cyan font-mono overflow-x-auto h-[120px] select-all scrollbar-thin">
                    {JSON.stringify({
                      id: selectedDoc.id,
                      vector_indices: Array.from({length: 5}, (_, i) => Math.floor(Math.random() * 1000000)),
                      payload: {
                        doc_id: selectedDoc.id,
                        name: selectedDoc.name,
                        kb_id: selectedDoc.kbId,
                        tags: selectedDoc.tags,
                        description: selectedDoc.metadata.description
                      }
                    }, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="text-[10px] text-muted border-t border-white/5 pt-4 flex justify-between font-mono mt-4">
                <span>Type: {selectedDoc.type.toUpperCase()}</span>
                <span>ID: {selectedDoc.id}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
