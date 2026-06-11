'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/navigation';
import { CommandMenu } from './command-menu';
import { 
  LayoutDashboard, Database, FileText, Search, GitBranch, 
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Compass, Menu, Bell, Loader2, Sparkles, Network, Activity, Users
} from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  // Setup Cmd+K event listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#030303] flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>
        <div className="flex flex-col items-center relative z-10">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent mb-6 shadow-xl shadow-primary/20 animate-pulse">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-primary animate-spin mb-4" />
          <h2 className="text-lg font-bold text-white tracking-wider">
            Loading Nexus<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RAG</span>...
          </h2>
          <p className="text-xs text-muted mt-2">Preparing multi-agent orchestrations</p>
        </div>
      </div>
    );
  }

  const publicPaths = ['/login', '/signup', '/forgot-password'];
  const isPublicPath = publicPaths.includes(pathname || '');

  // If not logged in and on a public page, just render the page (e.g. login/signup)
  if (!user && isPublicPath) {
    return <>{children}</>;
  }

  // If logged in but on a public page (auth redirect handled by Context), return empty loaders
  if (user && isPublicPath) {
    return null;
  }

  // If not logged in and on a protected page, return empty (redirecting)
  if (!user && !isPublicPath) {
    return null;
  }

  // Active link helper
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Knowledge Bases', icon: Database, path: '/knowledge-bases' },
    { label: 'Documents', icon: FileText, path: '/documents' },
    { label: 'Search & Ask', icon: Search, path: '/search' },
    { label: 'Knowledge Graph', icon: Network, path: '/graph' },
    { label: 'Agent Workflows', icon: GitBranch, path: '/workflows' },
    { label: 'AI Observability', icon: Activity, path: '/observability' },
    { label: 'Workspaces', icon: Users, path: '/workspaces' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground overflow-hidden">
      {/* ⌘K Command Menu */}
      <CommandMenu isOpen={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`glass-panel border-y-0 border-l-0 border-r border-white/5 flex flex-col shrink-0 transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-[70px]' : 'w-[250px]'
        }`}
      >
        {/* LOGO */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent shrink-0 shadow-md shadow-primary/10">
              <Compass className="w-4.5 h-4.5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-sm tracking-wide text-white whitespace-nowrap">
                Nexus<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">RAG</span>
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className="p-1 rounded-md text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="mx-auto p-1 rounded-md text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global command search trigger */}
        <div className="p-3">
          <button 
            onClick={() => setCommandMenuOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-xs text-muted cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Search commands...</span>}
            </div>
            {!sidebarCollapsed && (
              <kbd className="px-1.5 py-0.2 bg-white/10 text-[9px] font-mono rounded text-gray-400">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* NAV LIST */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center rounded-lg py-2.5 px-3 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer relative ${
                  active 
                    ? 'bg-gradient-to-r from-primary/20 via-accent/10 to-transparent text-white border-l-[3px] border-primary pl-[9px] shadow-md shadow-primary/5' 
                    : 'text-gray-400 hover:bg-white/[0.03] hover:text-white pl-[12px]'
                } ${sidebarCollapsed ? 'justify-center pl-0 hover:pl-0' : 'justify-start space-x-3'}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 ${
                  active ? 'text-primary scale-105' : 'text-gray-400 group-hover:text-white'
                }`} />
                {!sidebarCollapsed && <span className="font-sans">{item.label}</span>}
                
                {/* Active neon dot indicator */}
                {active && !sidebarCollapsed && (
                  <span className="absolute right-3 w-1 h-1 rounded-full bg-accent animate-pulse"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* CLOUD CONNECTED SYSTEMS */}
        {!sidebarCollapsed && (
          <div className="px-5 py-4 border-t border-white/5 space-y-3">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Integrations status
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full mr-2 animate-pulse"></span>
                  Qdrant Vector DB
                </span>
                <span className="text-[10px] text-accent-emerald bg-accent-emerald/10 px-1 py-0.2 rounded font-mono">Synced</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full mr-2 animate-pulse"></span>
                  OpenAI Models
                </span>
                <span className="text-[10px] text-accent-emerald bg-accent-emerald/10 px-1 py-0.2 rounded font-mono">Connected</span>
              </div>
            </div>
          </div>
        )}

        {/* USER PROFILE INFO & LOGOUT */}
        <div className="p-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* User Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'}
              alt={user?.name || 'User Profile'}
              className="w-8 h-8 rounded-full border border-white/10 object-cover shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-semibold text-white truncate whitespace-nowrap">
                  {user?.name}
                </span>
                <span className="text-[10px] text-muted truncate whitespace-nowrap">
                  {user?.email}
                </span>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <button 
              onClick={logout}
              className="p-1.5 rounded-lg text-muted hover:bg-accent-rose/10 hover:text-accent-rose transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* HEADER */}
        <header className="h-16 glass-panel border-x-0 border-t-0 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20 bg-[#090810]/40 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald mr-1 animate-pulse"></span>
              <select className="bg-transparent border-none text-white text-xs font-bold focus:outline-none cursor-pointer hover:text-primary transition-colors pr-1">
                <option value="prod" className="bg-[#0f0e1a]">NexusRAG (Prod)</option>
                <option value="dev" className="bg-[#0f0e1a]">NexusRAG (Dev)</option>
              </select>
            </div>
            <span className="text-gray-600">/</span>
            <span className="text-[11px] font-semibold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md flex items-center">
              <Sparkles className="w-3 h-3 text-accent mr-1.5 animate-pulse-glow" />
              {user?.role || 'Admin'}
            </span>
          </div>

          {/* Centered Search Everywhere quick link */}
          <div className="hidden md:flex items-center w-full max-w-[320px] mx-4">
            <button 
              onClick={() => setCommandMenuOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-xs text-muted cursor-pointer font-medium"
            >
              <div className="flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <span>Search everywhere...</span>
              </div>
              <kbd className="px-1.5 py-0.2 bg-white/10 text-[9px] font-mono rounded text-gray-400">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg text-muted hover:bg-white/5 hover:text-white transition-colors relative cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
            </button>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="text-[10px] text-muted font-mono hidden md:block">
              v1.0.0-Beta
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-6 md:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
