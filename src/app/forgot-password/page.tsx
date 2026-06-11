'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Compass, Mail, Loader2, ArrowLeft, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setMessage(res.message || 'Check your inbox for instructions.');
      } else {
        setError(res.error || 'Failed to request password reset.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
            Reset Password
          </h1>
          <p className="text-sm text-muted mt-2">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start space-x-3 p-3 rounded-lg border border-accent-rose/20 bg-accent-rose/5 text-accent-rose text-sm animate-slide-up">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="space-y-6 text-center animate-slide-up">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 text-sm text-primary hover:text-accent font-semibold transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-2 text-xs text-muted hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
