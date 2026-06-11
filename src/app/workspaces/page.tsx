'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, Database, Lock, Key, Activity, 
  Trash2, Edit3, Settings, HelpCircle, FileText, CheckCircle2,
  Calendar, Clock, ShieldCheck, Mail, ArrowRight, User
} from 'lucide-react';
import { getStoredDocs, getStoredKBs, KnowledgeBase } from '@/lib/db-mock';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'active' | 'invited' | 'disabled';
  avatar: string;
  lastActive: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
}

export default function WorkspacesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'matrix' | 'audit'>('members');
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  
  // Team Members State
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'm-1',
      name: 'Shiva Prabhakar',
      email: 'shiva.prabhakar@nexusrag.ai',
      role: 'Admin',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop',
      lastActive: 'Just now'
    },
    {
      id: 'm-2',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.j@nexusrag.ai',
      role: 'Editor',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop',
      lastActive: '2 hours ago'
    },
    {
      id: 'm-3',
      name: 'Michael Chen',
      email: 'm.chen@nexusrag.ai',
      role: 'Viewer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=128&auto=format&fit=crop',
      lastActive: 'Yesterday'
    },
    {
      id: 'm-4',
      name: 'Elena Rostova',
      email: 'elena.r@nexusrag.ai',
      role: 'Editor',
      status: 'invited',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=128&auto=format&fit=crop',
      lastActive: 'Pending invite'
    }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: '2026-06-11T10:14:22Z',
      user: 'Shiva Prabhakar',
      action: 'Uploaded Document',
      target: 'oncology_treatment_protocols_2026.docx',
      ip: '192.168.1.14'
    },
    {
      id: 'log-2',
      timestamp: '2026-06-11T09:42:05Z',
      user: 'Shiva Prabhakar',
      action: 'Created Collection',
      target: 'Medical Documents Base',
      ip: '192.168.1.14'
    },
    {
      id: 'log-3',
      timestamp: '2026-06-10T16:22:18Z',
      user: 'Dr. Sarah Jenkins',
      action: 'Modified Collection Config',
      target: 'AI Research Base',
      ip: '172.16.24.89'
    },
    {
      id: 'log-4',
      timestamp: '2026-06-10T11:05:44Z',
      user: 'System Bot',
      action: 'Purged Index Cache',
      target: 'Redis Semantic cache (TTL expire)',
      ip: 'localhost'
    },
    {
      id: 'log-5',
      timestamp: '2026-06-09T14:31:02Z',
      user: 'Shiva Prabhakar',
      action: 'Invited Team Member',
      target: 'elena.r@nexusrag.ai',
      ip: '192.168.1.14'
    }
  ]);

  // Share Settings Matrix (Collection access controls)
  const [sharingRules, setSharingRules] = useState<Record<string, { Admin: boolean; Editor: boolean; Viewer: boolean }>>({
    'kb-ai-research-v1': { Admin: true, Editor: true, Viewer: true },
    'kb-medical-docs-t2': { Admin: true, Editor: true, Viewer: false },
    'kb-company-knowledge': { Admin: true, Editor: true, Viewer: true },
  });

  useEffect(() => {
    setMounted(true);
    setKbs(getStoredKBs());
  }, []);

  if (!mounted) return null;

  const handleRoleChange = (id: string, role: TeamMember['role']) => {
    const updated = members.map(m => m.id === id ? { ...m, role } : m);
    setMembers(updated);
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Are you sure you want to remove this member? They will lose all access to this workspace.')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const handleToggleSharing = (kbId: string, role: 'Admin' | 'Editor' | 'Viewer') => {
    setSharingRules(prev => {
      const current = prev[kbId] || { Admin: true, Editor: true, Viewer: false };
      return {
        ...prev,
        [kbId]: {
          ...current,
          [role]: !current[role]
        }
      };
    });
  };

  return (
    <div className="space-y-6 animate-slide-up flex flex-col h-[calc(100vh-8.5rem)] text-left select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
            <Users className="w-5 h-5 text-primary mr-2.5" />
            Enterprise Workspace
          </h1>
          <p className="text-xs text-muted mt-0.5">Manage team access permissions, configure logical scopes, and review action trails.</p>
        </div>
        
        {/* Workspace status */}
        <div className="flex items-center space-x-3 text-xs bg-[#0b0b14]/80 border border-[#27274a] px-3.5 py-1.5 rounded-lg shadow-lg">
          <span className="flex items-center text-primary"><Shield className="w-3.5 h-3.5 mr-1" /> Tier: <strong className="text-white font-mono ml-1">Enterprise</strong></span>
          <span className="text-gray-600">|</span>
          <span className="text-accent-emerald font-semibold font-mono text-[10px]">SSO: SAML ACTIVE</span>
        </div>
      </div>

      {/* CORE WORKSPACE BOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 items-stretch">
        
        {/* LEFT TAB BAR */}
        <div className="xl:col-span-1 glass-panel p-5 rounded-xl border-white/5 flex flex-col justify-between space-y-6 shrink-0">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Settings Area</label>
            
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('members')}
                className={`w-full flex items-center space-x-3 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'members' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team Members</span>
              </button>

              <button 
                onClick={() => setActiveTab('matrix')}
                className={`w-full flex items-center space-x-3 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'matrix' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Permissions Matrix</span>
              </button>

              <button 
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center space-x-3 rounded-lg py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'audit' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Security Audit Logs</span>
              </button>
            </nav>
          </div>

          {/* HELP EXPLAINER */}
          <div className="p-3 bg-[#050507] border border-white/5 rounded-lg text-[10px] text-muted flex items-start space-x-2">
            <Lock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              PII redaction and HIPAA compliance logs are governed by active workspace policy. Changes update all client endpoints instantly.
            </p>
          </div>
        </div>

        {/* MAIN PANEL DISPLAY (Span 3) */}
        <div className="xl:col-span-3 glass-panel rounded-xl border-white/5 flex flex-col h-full overflow-hidden relative bg-[#040407]/30">
          <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>

          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden justify-between">
              
              {/* Table header bar */}
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#09090c]/40">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Collaborators ({members.length})</span>
                <button className="bg-primary hover:bg-primary-hover text-white text-[11px] font-semibold py-1 px-3 rounded flex items-center space-x-1 cursor-pointer active:scale-95 transition-all">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Collaborator</span>
                </button>
              </div>

              {/* Members Table */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5 px-3">Collaborator</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Last Active</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors text-gray-300">
                        <td className="py-3 px-3 flex items-center space-x-3 text-white font-bold">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full border border-white/10 object-cover shrink-0" />
                          <span>{m.name}</span>
                        </td>
                        <td className="py-3 px-3 text-muted font-mono">{m.email}</td>
                        <td className="py-3 px-3">
                          <select 
                            value={m.role}
                            onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                            disabled={m.role === 'Admin'} // Prevents self edit for admin demo
                            className="bg-transparent border-none text-white focus:outline-none cursor-pointer font-semibold"
                          >
                            <option value="Admin" className="bg-[#09090b]">Admin</option>
                            <option value="Editor" className="bg-[#09090b]">Editor</option>
                            <option value="Viewer" className="bg-[#09090b]">Viewer</option>
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-mono capitalize font-bold ${
                            m.status === 'active' ? 'text-accent-emerald bg-accent-emerald/10' :
                            m.status === 'invited' ? 'text-accent-amber bg-accent-amber/10 animate-pulse' : 'text-gray-500 bg-white/5'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-muted font-mono">{m.lastActive}</td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            disabled={m.role === 'Admin'}
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1 rounded text-muted hover:bg-accent-rose/10 hover:text-accent-rose transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: ACCESS MATRIX */}
          {activeTab === 'matrix' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden justify-between">
              
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#09090c]/40">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Sharing Matrix Rules</span>
                <span className="text-[10px] font-mono text-muted">Role-Based Access Control (RBAC)</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                <p className="text-xs text-muted leading-relaxed">
                  Assign which collections can be queried by users of specific roles. Access levels cascade downward.
                </p>

                <div className="space-y-4">
                  {kbs.map((kb) => {
                    const rules = sharingRules[kb.id] || { Admin: true, Editor: true, Viewer: false };
                    return (
                      <div key={kb.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{kb.name}</h4>
                            <span className="text-[9px] text-muted font-mono">{kb.id}</span>
                          </div>
                        </div>

                        {/* Toggle Switches */}
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9.5px] text-muted font-mono font-bold uppercase">ADMIN</span>
                            <button 
                              onClick={() => handleToggleSharing(kb.id, 'Admin')}
                              disabled // Admins always have access
                              className="w-7 h-4 rounded-full p-0.5 bg-primary cursor-not-allowed opacity-50"
                            >
                              <div className="w-3 h-3 rounded-full bg-white translate-x-3" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[9.5px] text-muted font-mono font-bold uppercase">EDITOR</span>
                            <button 
                              onClick={() => handleToggleSharing(kb.id, 'Editor')}
                              className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                                rules.Editor ? 'bg-primary' : 'bg-white/10'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                rules.Editor ? 'translate-x-3' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[9.5px] text-muted font-mono font-bold uppercase">VIEWER</span>
                            <button 
                              onClick={() => handleToggleSharing(kb.id, 'Viewer')}
                              className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${
                                rules.Viewer ? 'bg-primary' : 'bg-white/10'
                              }`}
                            >
                              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                                rules.Viewer ? 'translate-x-3' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AUDIT TRAILS */}
          {activeTab === 'audit' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden justify-between">
              
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#09090c]/40">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Workspace Audit Log Console</span>
                <span className="text-[10px] text-accent-cyan font-mono font-bold flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" /> SECURE AUDIT STATE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Scope Target</th>
                      <th className="py-2.5 px-3 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors text-gray-300 text-[10px]">
                        <td className="py-2.5 px-3 text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-white font-bold">{log.user}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex px-1 rounded text-[8.5px] font-bold ${
                            log.action.includes('Upload') ? 'text-primary bg-primary/10' :
                            log.action.includes('Modify') ? 'text-accent bg-accent/10' :
                            log.action.includes('Create') ? 'text-accent-cyan bg-accent-cyan/10' : 'text-accent-amber bg-accent-amber/10'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-400">{log.target}</td>
                        <td className="py-2.5 px-3 text-right text-muted">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
