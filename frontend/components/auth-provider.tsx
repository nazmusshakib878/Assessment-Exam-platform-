"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAuthenticatedUser, logout as logoutRequest, type AuthUser } from "@/lib/api";

const SESSION_KEY = "level-assessment-auth";

type StoredSession = { token: string; user: AuthUser };
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  setSession: (session: StoredSession) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readSession(): StoredSession | null {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;

    const session = JSON.parse(value) as StoredSession;
    if (!session.token || !session.user || !["admin", "student"].includes(session.user.role)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    async function initialize() {
      await Promise.resolve();
      const storedSession = readSession();

      if (!storedSession) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const { user: verifiedUser } = await getAuthenticatedUser(storedSession.token);
        const session = { token: storedSession.token, user: verifiedUser };
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setToken(storedSession.token);
        setUser(verifiedUser);
        setStatus("authenticated");
      } catch {
        clearSession();
      }
    }

    void initialize();
  }, [clearSession]);

  const setSession = useCallback((session: StoredSession) => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setToken(session.token);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await logoutRequest(token);
    } finally {
      clearSession();
    }
  }, [clearSession, token]);

  const value = useMemo(
    () => ({ status, user, token, setSession, logout }),
    [status, user, token, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}