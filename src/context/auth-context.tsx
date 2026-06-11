'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Check localStorage fallback for pure client side compatibility
          const fallbackToken = localStorage.getItem('nexusrag_token');
          const fallbackUser = localStorage.getItem('nexusrag_user');
          if (fallbackToken && fallbackUser) {
            setUser(JSON.parse(fallbackUser));
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error checking auth', err);
        // LocalStorage fallback
        const fallbackToken = localStorage.getItem('nexusrag_token');
        const fallbackUser = localStorage.getItem('nexusrag_user');
        if (fallbackToken && fallbackUser) {
          setUser(JSON.parse(fallbackUser));
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Protect routes client-side
  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ['/login', '/signup', '/forgot-password'];
    const isPublicPath = publicPaths.includes(pathname || '');

    if (!user && !isPublicPath) {
      router.replace('/login');
    } else if (user && isPublicPath) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Store in localStorage for client persistence fallback
        localStorage.setItem('nexusrag_token', data.token);
        localStorage.setItem('nexusrag_user', JSON.stringify(data.user));
        
        router.replace('/dashboard');
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: 'Network connection failed. Try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Store in localStorage for client persistence fallback
        localStorage.setItem('nexusrag_token', data.token);
        localStorage.setItem('nexusrag_user', JSON.stringify(data.user));

        router.replace('/dashboard');
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Signup failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network connection failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/me', { method: 'POST' });
    } catch (err) {
      console.error('API logout failed', err);
    } finally {
      setUser(null);
      localStorage.removeItem('nexusrag_token');
      localStorage.removeItem('nexusrag_user');
      setIsLoading(false);
      router.replace('/login');
    }
  };

  const forgotPassword = async (email: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    return { 
      success: true, 
      message: 'If that email address exists in our database, we have sent password reset instructions.' 
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
