"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAuthenticatedUser, logout as logoutRequest, type AuthUser } from "@/lib/api";

const SESSION_KEY = "level-assessment-auth";
let validatedSession: StoredSession | null | undefined;
let sessionValidationPromise: Promise<StoredSession | null> | null = null;

function setRoutingCookies(role: AuthUser["role"]) { document.cookie = `auth_present=1; Path=/; SameSite=Lax`; document.cookie = `auth_role=${role}; Path=/; SameSite=Lax`; }
function clearRoutingCookies() { document.cookie = "auth_present=; Path=/; SameSite=Lax; Max-Age=0"; document.cookie = "auth_role=; Path=/; SameSite=Lax; Max-Age=0"; }

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

function validateStoredSession(): Promise<StoredSession | null> {
  const storedSession = readSession();
  if (!storedSession) return Promise.resolve(null);
  if (validatedSession?.token === storedSession.token) return Promise.resolve(validatedSession);
  if (sessionValidationPromise) return sessionValidationPromise;

  sessionValidationPromise = getAuthenticatedUser(storedSession.token)
    .then(({ user: verifiedUser }) => {
      validatedSession = { token: storedSession.token, user: verifiedUser };
      return validatedSession;
    })
    .catch(() => null)
    .finally(() => {
      sessionValidationPromise = null;
    });

  return sessionValidationPromise;
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    validatedSession = null;
    window.sessionStorage.removeItem(SESSION_KEY);
    clearRoutingCookies();
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    async function initialize() {
      await Promise.resolve();
      const session = await validateStoredSession();

      if (!session) {
        clearSession();
        return;
      }

      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setToken(session.token);
      setUser(session.user);
      setStatus("authenticated");
    }

    void initialize();
  }, [clearSession]);

  const setSession = useCallback((session: StoredSession) => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setToken(session.token);
    setUser(session.user);
    setStatus("authenticated");
    setRoutingCookies(session.user.role);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await logoutRequest(token);
    } catch {
      // Always clear the local session if remote token revocation fails.
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