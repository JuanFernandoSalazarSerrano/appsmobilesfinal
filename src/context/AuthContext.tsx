import React, { createContext, useEffect, useMemo, useState } from 'react';
import { createId } from '../helpers/ids';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => AuthResult;
  register: (identifier: string, password: string) => AuthResult;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'eco-auth-session';

const DEMO_USERS: Record<string, { password: string; name: string }> = {
  james123: { password: 'password', name: 'James 123' },
  newuser: { password: 'contra', name: 'New User' }
};

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

const getDemoUser = (identifier: string) => {
  const normalized = normalizeIdentifier(identifier);
  if (!normalized) {
    return null;
  }

  const match = DEMO_USERS[normalized];
  if (!match) {
    return null;
  }

  return { username: normalized, ...match };
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        const match = getDemoUser(parsed.email ?? '');
        if (match) {
          setUser({
            id: parsed.id ?? createId(),
            email: match.username,
            name: parsed.name ?? match.name
          });
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persistUser = (nextUser: AuthUser | null) => {
    if (nextUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const startSession = (username: string, name: string) => {
    const nextUser: AuthUser = {
      id: createId(),
      email: username,
      name
    };
    setUser(nextUser);
    persistUser(nextUser);
    return nextUser;
  };

  const login = (identifier: string, password: string): AuthResult => {
    const trimmedPassword = password.trim();
    if (!identifier.trim() || !trimmedPassword) {
      return { ok: false, message: 'Enter your username and password.' };
    }

    const match = getDemoUser(identifier);
    if (!match || match.password !== trimmedPassword) {
      return {
        ok: false,
        message: 'Invalid credentials. Use james123/password or newuser/contra.'
      };
    }

    const nextUser = startSession(match.username, match.name);
    return { ok: true, user: nextUser };
  };

  const register = (identifier: string, password: string): AuthResult => {
    const trimmedPassword = password.trim();
    if (!identifier.trim() || !trimmedPassword) {
      return { ok: false, message: 'Enter your username and password.' };
    }

    const match = getDemoUser(identifier);
    if (!match || match.password !== trimmedPassword) {
      return {
        ok: false,
        message: 'Registration is disabled. Use the demo credentials instead.'
      };
    }

    const nextUser = startSession(match.username, match.name);
    return { ok: true, user: nextUser };
  };

  const logout = () => {
    setUser(null);
    persistUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
