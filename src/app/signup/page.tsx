'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Compass, User, Lock, Mail, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(name, email, password);
      if (!res.success) {
        setError(res.error || 'Registration failed. Try a different email.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-background overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-60"></div>
      
      {/* Soft gradient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent/10 blur-[100px] pointer-events-none"></div>

      {/* Main card */}
      <div className="relative w-full max-w-[440px] px-6 py-8 md:p-10 glass-panel rounded-2xl shadow-2xl animate-fade-in z-10 border-white/5">
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent mb-4 shadow-lg shadow-primary/20">
            <Compass className="w-6 h-6 text-white animate-pulse-glow" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Get Started
          </h1>
          <p className="text-sm text-muted mt-2">
            Create your NexusRAG enterprise workspace
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start space-x-3 p-3 rounded-lg border border-accent-rose/20 bg-accent-rose/5 text-accent-rose text-sm animate-slide-up">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Work Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 chars)"
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-3 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 text-center">
          <p className="text-xs text-muted">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-primary hover:text-accent font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
