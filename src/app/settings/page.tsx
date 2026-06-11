'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Key, ShieldCheck, Users, Database, Sparkles, 
  HelpCircle, Eye, EyeOff, Save, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('integrations');

  // Integrations state
  const [openaiKey, setOpenaiKey] = useState('sk-proj-••••••••••••••••••••');
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-••••••••••••••••••••');
  const [qdrantUrl, setQdrantUrl] = useState('https://nexusrag-cluster.qdrant.tech');
  const [qdrantKey, setQdrantKey] = useState('••••••••••••••••••••••••••••');
  
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showQdrant, setShowQdrant] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);

  // PII Redaction configs (Enterprise Feature #8)
  const [redactEmails, setRedactEmails] = useState(true);
  const [redactPhones, setRedactPhones] = useState(true);
  const [redactSsns, setRedactSsns] = useState(true);
  const [redactApiKeys, setRedactApiKeys] = useState(true);

  // Semantic Cache policies (Enterprise Feature #7)
  const [enableSemanticCache, setEnableSemanticCache] = useState(true);
  const [cacheTtl, setCacheTtl] = useState(12); // Hours
  const [cacheThreshold, setCacheThreshold] = useState(0.88); // Cosine Similarity threshold

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Settings</h1>
        <p className="text-sm text-muted mt-1">Configure workspace keys, access tokens, and compliance guardrails.</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side Tab Navigation */}
        <aside className="w-full lg:w-[220px] shrink-0 space-y-1">
          {[
            { id: 'integrations', label: 'API Keys & Providers', icon: Key },
            { id: 'compliance', label: 'PII & Compliance', icon: ShieldCheck },
            { id: 'cache', label: 'Semantic Cache Policy', icon: Database },
            { id: 'team', label: 'Access Controls', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                  active 
                    ? 'bg-white/10 text-white font-bold' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Side Content Panel */}
        <div className="flex-1 glass-panel p-6 md:p-8 rounded-xl border-white/5 relative">
          
          {/* Saved Notification Toast */}
          {isSaved && (
            <div className="absolute top-4 right-4 flex items-center space-x-2 text-xs text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1.5 rounded-lg animate-fade-in z-10">
              <CheckCircle2 className="w-4 h-4" />
              <span>Workspace configurations updated.</span>
            </div>
          )}

          {/* TAB 1: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">API Keys & Model Providers</h3>
                <p className="text-xs text-muted mt-1">Manage credentials for external LLM reasoning nodes and vector clusters.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                {/* OpenAI */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">OpenAI Private Key</label>
                  <div className="relative flex items-center">
                    <input
                      type={showOpenai ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="w-full pr-10 py-2 rounded-lg glass-input text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenai(!showOpenai)}
                      className="absolute right-3 text-muted hover:text-white cursor-pointer"
                    >
                      {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Anthropic */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Anthropic Claude Key</label>
                  <div className="relative flex items-center">
                    <input
                      type={showAnthropic ? 'text' : 'password'}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      className="w-full pr-10 py-2 rounded-lg glass-input text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropic(!showAnthropic)}
                      className="absolute right-3 text-muted hover:text-white cursor-pointer"
                    >
                      {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Qdrant DB Cloud Connection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Qdrant Cluster URL</label>
                    <input
                      type="text"
                      value={qdrantUrl}
                      onChange={(e) => setQdrantUrl(e.target.value)}
                      className="w-full py-2 rounded-lg glass-input text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Qdrant API Key</label>
                    <div className="relative flex items-center">
                      <input
                        type={showQdrant ? 'text' : 'password'}
                        value={qdrantKey}
                        onChange={(e) => setQdrantKey(e.target.value)}
                        className="w-full pr-10 py-2 rounded-lg glass-input text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowQdrant(!showQdrant)}
                        className="absolute right-3 text-muted hover:text-white cursor-pointer"
                      >
                        {showQdrant ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center space-x-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/10 cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save API Keys</span>
              </button>
            </form>
          )}

          {/* TAB 2: PII COMPLIANCE (Enterprise Feature #8) */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                  <Sparkles className="w-4 h-4 text-accent mr-2 animate-pulse" />
                  PII Compliance Redaction Settings
                </h3>
                <p className="text-xs text-muted mt-1">Ensure sensitive client database records are scrubbed and anonymized before querying model boundaries.</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5 text-xs text-left">
                {[
                  { label: 'Redact Email Addresses', desc: 'Masks standard format email strings (e.g. name@company.com) to [EMAIL_1]', checked: redactEmails, setChecked: setRedactEmails },
                  { label: 'Redact Phone Numbers', desc: 'Masks telephone patterns matching international/local formats to [PHONE_NUMBER]', checked: redactPhones, setChecked: setRedactPhones },
                  { label: 'Redact Social Security Numbers', desc: 'Masks SSN/Identities matching standard government patterns to [SSN_CARD]', checked: redactSsns, setChecked: setRedactSsns },
                  { label: 'Redact Private API Keys', desc: 'Masks API secrets, AWS tokens, and private credential signatures to [ACCESS_KEY]', checked: redactApiKeys, setChecked: setRedactApiKeys },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold text-white">{item.label}</span>
                      <span className="text-[10px] text-muted">{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.setChecked(!item.checked)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        item.checked ? 'bg-primary' : 'bg-white/10'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        item.checked ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEMANTIC CACHE POLICY (Enterprise Feature #7) */}
          {activeTab === 'cache' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
                  <Database className="w-4 h-4 text-primary mr-2" />
                  Redis Semantic Cache Policy
                </h3>
                <p className="text-xs text-muted mt-1">Configure Redis vector embedding semantic caches to immediately match queries and bypass LLM costs.</p>
              </div>

              <div className="space-y-6 pt-4 border-t border-white/5 text-xs text-left">
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold text-white">Enable Redis Semantic Caching</span>
                    <span className="text-[10px] text-muted">Bypasses reasoning agent loops when matching query similarity scores exceed thresholds.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableSemanticCache(!enableSemanticCache)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      enableSemanticCache ? 'bg-primary' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      enableSemanticCache ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {enableSemanticCache && (
                  <>
                    {/* Similarity Slider */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-300">
                          Semantic Similarity Threshold ({cacheThreshold})
                        </span>
                        <span className="text-[10px] text-muted font-mono">Cosine Match Score</span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="0.98"
                        step="0.01"
                        value={cacheThreshold}
                        onChange={(e) => setCacheThreshold(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="text-[10px] text-muted leading-relaxed">
                        Queries matching cached prompts with similarity scores greater than <strong>{cacheThreshold}</strong> will instantly return cached outputs.
                      </div>
                    </div>

                    {/* TTL Slider */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-300">
                          Cache Expiration TTL ({cacheTtl} Hours)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="72"
                        step="1"
                        value={cacheTtl}
                        onChange={(e) => setCacheTtl(Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS CONTROL */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Access Controls</h3>
                <p className="text-xs text-muted mt-1">Configure role privileges, invitation links, and coordinate workspace memberships.</p>
              </div>

              <div className="overflow-x-auto pt-4 border-t border-white/5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase text-[9px] tracking-wider">
                      <th className="py-2">User</th>
                      <th className="py-2">Role</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Shivansh', email: 'shivansh.owner@nexusrag.com', role: 'Owner / Administrator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop' },
                      { name: 'Shivansh', email: 'shivansh.dev@nexusrag.com', role: 'Developer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop' },
                    ].map((user, idx) => (
                      <tr key={idx} className="border-b border-white/5 text-gray-300">
                        <td className="py-3 flex items-center space-x-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={user.avatar} alt={user.name} className="w-6.5 h-6.5 rounded-full object-cover border border-white/10" />
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-white">{user.name}</span>
                            <span className="text-[10px] text-muted">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted">{user.role}</td>
                        <td className="py-3 text-right">
                          <span className="text-[10px] font-bold text-accent-emerald bg-accent-emerald/10 px-1.5 py-0.2 rounded">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-lg border border-accent-amber/20 bg-accent-amber/5 text-accent-amber text-xs flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-left">
                  <span className="font-bold">Access Warning:</span> Member permissions route document index deletion rights. Configure roles carefully to prevent collection corruption.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
