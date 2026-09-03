import { useState, useEffect, useCallback } from "react";

interface SessionUser {
  email: string;
  name: string;
  role: string;
  ts: number;
  provider?: string;
  guest?: boolean;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pulseflow_session");
      if (raw) {
        const parsed: SessionUser = JSON.parse(raw);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      // ignore corrupt data
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (_provider?: string) => {
    // Auth is handled in the Auth page via localStorage before calling this.
    // This is a no-op stub so callers (RequireAuth, Sidebar, etc.) don't break.
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem("pulseflow_session");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
