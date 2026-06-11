'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LayoutDashboard, Database, FileText, GitBranch, BarChart3, Settings, LogOut, Terminal, Network, Activity, Users } from 'lucide-react';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => router.push('/dashboard') },
    { label: 'Manage Knowledge Bases', icon: Database, action: () => router.push('/knowledge-bases') },
    { label: 'Upload & View Documents', icon: FileText, action: () => router.push('/documents') },
    { label: 'Search & Ask AI', icon: Search, action: () => router.push('/search') },
    { label: 'Explore Knowledge Graph', icon: Network, action: () => router.push('/graph') },
    { label: 'Agent Workflows Canvas', icon: GitBranch, action: () => router.push('/workflows') },
    { label: 'AI Observability telemetry', icon: Activity, action: () => router.push('/observability') },
    { label: 'Workspace & Collaborators', icon: Users, action: () => router.push('/workspaces') },
    { label: 'System Analytics & Costs', icon: BarChart3, action: () => router.push('/analytics') },
    { label: 'Platform Settings', icon: Settings, action: () => router.push('/settings') },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
      <div 
        ref={menuRef}
        className="w-full max-w-[550px] glass-panel rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[350px]"
      >
        <div className="relative border-b border-white/5 flex items-center px-4 py-3 shrink-0">
          <Search className="w-4 h-4 text-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search page..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-muted focus:outline-none"
          />
          <div className="text-[10px] bg-white/5 border border-white/10 text-muted px-1.5 py-0.5 rounded uppercase font-mono">
            esc
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.label}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white/10 text-white pl-4' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                      <span>{cmd.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-muted font-mono flex items-center">
                        Jump <Terminal className="w-3 h-3 ml-1" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted">
              No matching commands found.
            </div>
          )}
        </div>
        
        <div className="bg-white/[0.02] border-t border-white/5 py-2.5 px-4 flex items-center justify-between text-[11px] text-muted shrink-0">
          <div className="flex space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>NexusRAG Command Menu</span>
        </div>
      </div>
    </div>
  );
}
